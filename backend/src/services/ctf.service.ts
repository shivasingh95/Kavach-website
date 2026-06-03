import bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
import type { CTFChallenge, CTFSubmission } from '../types/models';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fromFirestore = (data: FirebaseFirestore.DocumentData): any => {
  const result: any = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val.toDate === 'function') {
      result[key] = val.toDate();
    } else {
      result[key] = val;
    }
  }
  return result;
};

const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─── Create Challenge (Admin) ───────────────────────────────────────────────

export const createChallenge = async (
  data: {
    title: string;
    description: string;
    category: CTFChallenge['category'];
    difficulty: CTFChallenge['difficulty'];
    points: number;
    flag: string;
    hints?: { id: string; text: string; cost: number }[];
    isActive?: boolean;
  },
  createdById: string
): Promise<CTFChallenge> => {
  const flagHash = await bcrypt.hash(data.flag, 12);
  const now = new Date();
  const id = createId();

  const challenge: CTFChallenge = {
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    points: data.points,
    flagHash,
    hints: data.hints?.map(h => h.text) ?? [],
    isActive: data.isActive ?? true,
    solveCount: 0,
    createdById,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('ctfChallenges').doc(id).set(challenge);
  logger.info(`CTF challenge created: ${data.title} (${id})`);
  return challenge;
};

// ─── Get All Challenges ─────────────────────────────────────────────────────

export const getAllChallenges = async (
  includeInactive: boolean = false
): Promise<Omit<CTFChallenge, 'flagHash'>[]> => {
  let query: FirebaseFirestore.Query = db.collection('ctfChallenges');

  if (!includeInactive) {
    query = query.where('isActive', '==', true);
  }

  const snapshot = await query.get();

  const results = snapshot.docs.map((doc) => {
    const data = fromFirestore(doc.data()) as CTFChallenge;
    const { flagHash, ...rest } = data;
    return rest;
  });

  // Sort in-memory to avoid Firebase composite index requirement
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// ─── Get Challenge By ID ────────────────────────────────────────────────────

export const getChallengeById = async (
  challengeId: string,
  isAdmin: boolean = false
): Promise<Omit<CTFChallenge, 'flagHash'> | null> => {
  const doc = await db.collection('ctfChallenges').doc(challengeId).get();
  if (!doc.exists) return null;

  const data = fromFirestore(doc.data()!) as CTFChallenge;
  const { flagHash, ...rest } = data;
  return rest;
};

// ─── Update Challenge (Admin) ───────────────────────────────────────────────

export const updateChallenge = async (
  challengeId: string,
  data: Partial<{
    title: string;
    description: string;
    category: CTFChallenge['category'];
    difficulty: CTFChallenge['difficulty'];
    points: number;
    flag: string;
    hints: string[];
    isActive: boolean;
  }>
): Promise<void> => {
  const updateData: any = { ...data, updatedAt: new Date() };

  // If flag is being changed, hash it
  if (data.flag) {
    updateData.flagHash = await bcrypt.hash(data.flag, 12);
    delete updateData.flag;
  }

  await db.collection('ctfChallenges').doc(challengeId).update(updateData);
  logger.info(`CTF challenge updated: ${challengeId}`);
};

// ─── Delete Challenge (Admin) ───────────────────────────────────────────────

export const deleteChallenge = async (challengeId: string): Promise<void> => {
  await db.collection('ctfChallenges').doc(challengeId).delete();
  logger.info(`CTF challenge deleted: ${challengeId}`);
};

// ─── Submit Flag ────────────────────────────────────────────────────────────

export const submitFlag = async (
  userId: string,
  challengeId: string,
  submittedFlag: string
): Promise<{ isCorrect: boolean; message: string; pointsAwarded?: number }> => {
  // Get challenge
  const challengeDoc = await db.collection('ctfChallenges').doc(challengeId).get();
  if (!challengeDoc.exists) {
    throw Object.assign(new Error('Challenge not found'), { statusCode: 404 });
  }

  const challenge = fromFirestore(challengeDoc.data()!) as CTFChallenge;

  if (!challenge.isActive) {
    throw Object.assign(new Error('This challenge is no longer active'), { statusCode: 400 });
  }

  // Check for duplicate submission (already solved)
  const existingSolve = await db
    .collection('ctfSubmissions')
    .where('userId', '==', userId)
    .where('challengeId', '==', challengeId)
    .where('isCorrect', '==', true)
    .limit(1)
    .get();

  if (!existingSolve.empty) {
    return { isCorrect: true, message: 'You have already solved this challenge' };
  }

  // Validate flag
  const isCorrect = await bcrypt.compare(submittedFlag, challenge.flagHash);

  const submissionId = createId();
  const submission: CTFSubmission = {
    id: submissionId,
    userId,
    challengeId,
    submittedFlag: isCorrect ? '[REDACTED]' : submittedFlag,
    isCorrect,
    status: isCorrect ? 'APPROVED' : 'REJECTED',
    submittedAt: new Date(),
  };

  await db.collection('ctfSubmissions').doc(submissionId).set(submission);

  if (isCorrect) {
    // Use a transaction to atomically update solve count and user points
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const challengeRef = db.collection('ctfChallenges').doc(challengeId);

      const userDoc = await transaction.get(userRef);
      const chalDoc = await transaction.get(challengeRef);

      if (userDoc.exists) {
        const currentPoints = userDoc.data()?.totalPoints || 0;
        transaction.update(userRef, {
          totalPoints: currentPoints + challenge.points,
          updatedAt: new Date(),
        });
      }

      if (chalDoc.exists) {
        const currentSolves = chalDoc.data()?.solveCount || 0;
        transaction.update(challengeRef, {
          solveCount: currentSolves + 1,
        });
      }
    });

    logger.info(`User ${userId} solved challenge ${challengeId} (+${challenge.points} pts)`);
    return {
      isCorrect: true,
      message: `Correct! You earned ${challenge.points} points.`,
      pointsAwarded: challenge.points,
    };
  }

  return { isCorrect: false, message: 'Incorrect flag. Try again!' };
};

// ─── Get Leaderboard ────────────────────────────────────────────────────────

export const getLeaderboard = async (
  limit: number = 50
): Promise<{ rank: number; id: string; name: string; totalPoints: number; solveCount: number }[]> => {
  const usersSnapshot = await db
    .collection('users')
    .orderBy('totalPoints', 'desc')
    .limit(limit)
    .get();

  const leaderboard = await Promise.all(
    usersSnapshot.docs.map(async (doc, index) => {
      const user = fromFirestore(doc.data());

      // Count solves for this user
      const solvesSnapshot = await db
        .collection('ctfSubmissions')
        .where('userId', '==', user.id)
        .where('isCorrect', '==', true)
        .get();

      return {
        rank: index + 1,
        id: user.id,
        name: user.name,
        totalPoints: user.totalPoints || 0,
        solveCount: solvesSnapshot.size,
      };
    })
  );

  return leaderboard;
};

// ─── Get User Submissions ───────────────────────────────────────────────────

export const getUserSubmissions = async (
  userId: string
): Promise<CTFSubmission[]> => {
  const snapshot = await db
    .collection('ctfSubmissions')
    .where('userId', '==', userId)
    .orderBy('submittedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => fromFirestore(doc.data()) as CTFSubmission);
};

// ─── Admin: Get All Submissions ─────────────────────────────────────────────

export const getAllSubmissions = async (
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<CTFSubmission[]> => {
  let query: FirebaseFirestore.Query = db.collection('ctfSubmissions');

  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.get();
  const results = snapshot.docs.map((doc) => fromFirestore(doc.data()) as CTFSubmission);
  
  // Sort in-memory to avoid Firebase composite index requirement
  return results.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

// ─── Admin: Review Submission ───────────────────────────────────────────────

export const reviewSubmission = async (
  submissionId: string,
  adminId: string,
  data: {
    status: 'APPROVED' | 'REJECTED';
    reviewNote?: string;
  }
): Promise<void> => {
  const submissionRef = db.collection('ctfSubmissions').doc(submissionId);
  
  await db.runTransaction(async (transaction) => {
    const submissionDoc = await transaction.get(submissionRef);
    if (!submissionDoc.exists) {
      throw Object.assign(new Error('Submission not found'), { statusCode: 404 });
    }

    const submission = fromFirestore(submissionDoc.data()!) as CTFSubmission;
    
    if (submission.status !== 'PENDING') {
      throw Object.assign(new Error('Submission is already reviewed'), { statusCode: 400 });
    }

    transaction.update(submissionRef, {
      status: data.status,
      reviewNote: data.reviewNote || null,
      reviewedById: adminId,
      reviewedAt: new Date(),
    });

    // If approved, award points to the user
    if (data.status === 'APPROVED') {
      const challengeRef = db.collection('ctfChallenges').doc(submission.challengeId);
      const chalDoc = await transaction.get(challengeRef);
      
      if (chalDoc.exists) {
        const challenge = chalDoc.data() as CTFChallenge;
        const userRef = db.collection('users').doc(submission.userId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists) {
          const currentPoints = userDoc.data()?.totalPoints || 0;
          transaction.update(userRef, {
            totalPoints: currentPoints + challenge.points,
            updatedAt: new Date()
          });
        }
      }
    }
  });

  logger.info(`Admin ${adminId} reviewed submission ${submissionId} as ${data.status}`);
};
