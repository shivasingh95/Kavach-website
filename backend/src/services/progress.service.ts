import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
import type { CTFChallenge } from '../types/models';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserSummary {
  uid: string;
  displayName?: string;
  avatar?: string;
  totalPoints: number;
  ctfSolves: number;
  daysCompleted: number;
  eventsAttended: number;
  memberScore: number;
  currentStreak: number;
  longestStreak: number;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  uid: string;
  displayName?: string;
  avatar?: string;
  totalPoints: number;
  ctfSolves: number;
  daysCompleted: number;
  eventsAttended: number;
  memberScore: number;
  currentStreak: number;
  longestStreak: number;
  rank?: number;
  updatedAt: Date;
}

export interface CTFSolveDoc {
  challengeId: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  solvedAt: Date;
}

export interface DayDoc {
  dayNumber: number;
  roomName: string;
  platform: string;
  completedAt: Date;
}

export interface EventParticipationDoc {
  eventId: string;
  title: string;
  status: 'RSVP' | 'ATTENDED' | 'CANCELLED';
  registeredAt: Date;
  attendedAt?: Date;
}

export interface ActivityLogEntry {
  id: string;
  type: 'CTF_SOLVE' | 'DAY_COMPLETE' | 'EVENT_RSVP' | 'EVENT_ATTEND' | 'DAY_UNCOMPLETE';
  title: string;
  description: string;
  points?: number;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * calculateMemberScore: composite score combining points, days, events, and solves
 */
export const calculateMemberScore = (summary: Partial<UserSummary>): number => {
  const totalPoints = summary.totalPoints ?? 0;
  const daysCompleted = summary.daysCompleted ?? 0;
  const eventsAttended = summary.eventsAttended ?? 0;
  const ctfSolves = summary.ctfSolves ?? 0;

  return (totalPoints * 1) + (daysCompleted * 10) + (eventsAttended * 50) + (ctfSolves * 5);
};

/**
 * calculateStreak: reads the user's days sub-collection and determines
 * the current consecutive streak and the longest ever streak.
 */
export const calculateStreak = async (uid: string): Promise<{ currentStreak: number; longestStreak: number }> => {
  const daysSnapshot = await db
    .collection('users')
    .doc(uid)
    .collection('days')
    .orderBy('dayNumber', 'asc')
    .get();

  if (daysSnapshot.empty) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dayNumbers = daysSnapshot.docs
    .map(doc => doc.data().dayNumber as number)
    .sort((a, b) => a - b);

  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < dayNumbers.length; i++) {
    if (dayNumbers[i] === dayNumbers[i - 1] + 1) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  // Check if the current streak is still active (last day is the most recent)
  const maxDay = dayNumbers[dayNumbers.length - 1];
  let trailingStreak = 1;
  for (let i = dayNumbers.length - 2; i >= 0; i--) {
    if (dayNumbers[i] === dayNumbers[i + 1] - 1) {
      trailingStreak++;
    } else {
      break;
    }
  }
  currentStreak = trailingStreak;
  if (longestStreak < trailingStreak) longestStreak = trailingStreak;

  return { currentStreak, longestStreak };
};

/**
 * getOrInitSummary: reads the user summary doc, or initializes a default if it doesn't exist.
 */
const getOrInitSummary = async (
  transaction: FirebaseFirestore.Transaction,
  summaryRef: FirebaseFirestore.DocumentReference
): Promise<UserSummary> => {
  const doc = await transaction.get(summaryRef);
  if (doc.exists) {
    return fromFirestore(doc.data()!) as UserSummary;
  }
  // Get user display name & avatar from the root users doc
  const userDoc = await summaryRef.firestore.collection('users').doc(summaryRef.parent.parent?.id || '').get();
  const userData = userDoc.exists ? userDoc.data()! : {};
  return {
    uid: summaryRef.parent.parent?.id || '',
    displayName: userData.name || userData.displayName || '',
    avatar: userData.avatar || userData.photoURL || '',
    totalPoints: 0,
    ctfSolves: 0,
    daysCompleted: 0,
    eventsAttended: 0,
    memberScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    updatedAt: new Date(),
  };
};

// ─── Record CTF Solve ─────────────────────────────────────────────────────────

export const recordCTFSolve = async (
  uid: string,
  challenge: Pick<CTFChallenge, 'id' | 'title' | 'category' | 'difficulty' | 'points'>
): Promise<void> => {
  const userRef = db.collection('users').doc(uid);
  const summaryRef = userRef.collection('summary').doc('data');
  const solveRef = userRef.collection('ctf_solves').doc(challenge.id);
  const leaderboardRef = db.collection('leaderboard').doc(uid);
  const activityRef = userRef.collection('activity_log').doc(createId());

  await db.runTransaction(async (transaction) => {
    // Check if already solved (idempotency guard)
    const existingSolve = await transaction.get(solveRef);
    if (existingSolve.exists) {
      logger.info(`User ${uid} already has solve recorded for challenge ${challenge.id}`);
      return;
    }

    const summary = await getOrInitSummary(transaction, summaryRef);
    const now = new Date();

    // Write solve doc
    const solveDoc: CTFSolveDoc = {
      challengeId: challenge.id,
      title: challenge.title,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      solvedAt: now,
    };
    transaction.set(solveRef, solveDoc);

    // Update summary
    const updatedSummary: UserSummary = {
      ...summary,
      totalPoints: summary.totalPoints + challenge.points,
      ctfSolves: summary.ctfSolves + 1,
      updatedAt: now,
    };
    updatedSummary.memberScore = calculateMemberScore(updatedSummary);
    transaction.set(summaryRef, updatedSummary);

    // Update leaderboard
    transaction.set(leaderboardRef, {
      uid,
      displayName: updatedSummary.displayName,
      avatar: updatedSummary.avatar,
      totalPoints: updatedSummary.totalPoints,
      ctfSolves: updatedSummary.ctfSolves,
      daysCompleted: updatedSummary.daysCompleted,
      eventsAttended: updatedSummary.eventsAttended,
      memberScore: updatedSummary.memberScore,
      currentStreak: updatedSummary.currentStreak,
      longestStreak: updatedSummary.longestStreak,
      updatedAt: now,
    });

    // Append activity log entry
    const activityEntry: ActivityLogEntry = {
      id: activityRef.id,
      type: 'CTF_SOLVE',
      title: `Solved: ${challenge.title}`,
      description: `${challenge.category} · ${challenge.difficulty} · +${challenge.points} pts`,
      points: challenge.points,
      timestamp: now,
    };
    transaction.set(activityRef, activityEntry);
  });

  logger.info(`Progress: CTF solve recorded for user ${uid}, challenge ${challenge.id}`);
};

// ─── Record Day Complete ──────────────────────────────────────────────────────

export const recordDayComplete = async (
  uid: string,
  dayNumber: number,
  roomName: string,
  platform: string = 'TryHackMe'
): Promise<void> => {
  const userRef = db.collection('users').doc(uid);
  const summaryRef = userRef.collection('summary').doc('data');
  const dayRef = userRef.collection('days').doc(String(dayNumber));
  const leaderboardRef = db.collection('leaderboard').doc(uid);
  const activityRef = userRef.collection('activity_log').doc(createId());

  await db.runTransaction(async (transaction) => {
    const existingDay = await transaction.get(dayRef);
    if (existingDay.exists) {
      // Already marked complete, no-op
      return;
    }

    const summary = await getOrInitSummary(transaction, summaryRef);
    const now = new Date();

    // Write day doc
    const dayDoc: DayDoc = {
      dayNumber,
      roomName,
      platform,
      completedAt: now,
    };
    transaction.set(dayRef, dayDoc);

    // We'll recalculate streak outside the transaction (after the write)
    const updatedSummary: UserSummary = {
      ...summary,
      daysCompleted: summary.daysCompleted + 1,
      updatedAt: now,
    };
    updatedSummary.memberScore = calculateMemberScore(updatedSummary);
    transaction.set(summaryRef, updatedSummary);

    transaction.set(leaderboardRef, {
      uid,
      displayName: updatedSummary.displayName,
      avatar: updatedSummary.avatar,
      totalPoints: updatedSummary.totalPoints,
      ctfSolves: updatedSummary.ctfSolves,
      daysCompleted: updatedSummary.daysCompleted,
      eventsAttended: updatedSummary.eventsAttended,
      memberScore: updatedSummary.memberScore,
      currentStreak: updatedSummary.currentStreak,
      longestStreak: updatedSummary.longestStreak,
      updatedAt: now,
    });

    const activityEntry: ActivityLogEntry = {
      id: activityRef.id,
      type: 'DAY_COMPLETE',
      title: `Day ${dayNumber} Complete!`,
      description: `Completed "${roomName}" on ${platform}`,
      points: 10, // 10 memberScore points per day
      timestamp: now,
    };
    transaction.set(activityRef, activityEntry);
  });

  // Recalculate streak and patch after transaction (reads outside transaction for safety)
  try {
    const { currentStreak, longestStreak } = await calculateStreak(uid);
    const summaryDoc = await summaryRef.get();
    const currentMemberScore = calculateMemberScore(fromFirestore(summaryDoc.data() || {}) as UserSummary);

    await summaryRef.update({ currentStreak, longestStreak, memberScore: currentMemberScore, updatedAt: new Date() });
    await db.collection('leaderboard').doc(uid).update({ currentStreak, longestStreak, memberScore: currentMemberScore, updatedAt: new Date() });
  } catch (e) {
    logger.error(`Failed to update streak for user ${uid}: ${e}`);
  }

  logger.info(`Progress: Day ${dayNumber} completed for user ${uid}`);
};

// ─── Record Day Uncomplete ────────────────────────────────────────────────────

export const recordDayUncomplete = async (
  uid: string,
  dayNumber: number
): Promise<void> => {
  const userRef = db.collection('users').doc(uid);
  const summaryRef = userRef.collection('summary').doc('data');
  const dayRef = userRef.collection('days').doc(String(dayNumber));
  const leaderboardRef = db.collection('leaderboard').doc(uid);
  const activityRef = userRef.collection('activity_log').doc(createId());

  await db.runTransaction(async (transaction) => {
    const existingDay = await transaction.get(dayRef);
    if (!existingDay.exists) {
      // Already not completed, no-op
      return;
    }

    const summary = await getOrInitSummary(transaction, summaryRef);
    const now = new Date();

    // Delete the day doc
    transaction.delete(dayRef);

    const updatedSummary: UserSummary = {
      ...summary,
      daysCompleted: Math.max(0, summary.daysCompleted - 1),
      updatedAt: now,
    };
    updatedSummary.memberScore = calculateMemberScore(updatedSummary);
    transaction.set(summaryRef, updatedSummary);

    transaction.set(leaderboardRef, {
      uid,
      displayName: updatedSummary.displayName,
      avatar: updatedSummary.avatar,
      totalPoints: updatedSummary.totalPoints,
      ctfSolves: updatedSummary.ctfSolves,
      daysCompleted: updatedSummary.daysCompleted,
      eventsAttended: updatedSummary.eventsAttended,
      memberScore: updatedSummary.memberScore,
      currentStreak: updatedSummary.currentStreak,
      longestStreak: updatedSummary.longestStreak,
      updatedAt: now,
    });

    const dayData = fromFirestore(existingDay.data()!) as DayDoc;
    const activityEntry: ActivityLogEntry = {
      id: activityRef.id,
      type: 'DAY_UNCOMPLETE',
      title: `Day ${dayNumber} Unmarked`,
      description: `Uncompleted "${dayData.roomName}" on ${dayData.platform}`,
      timestamp: now,
    };
    transaction.set(activityRef, activityEntry);
  });

  // Recalculate streak after transaction
  try {
    const { currentStreak, longestStreak } = await calculateStreak(uid);
    await summaryRef.update({ currentStreak, longestStreak, updatedAt: new Date() });
    await db.collection('leaderboard').doc(uid).update({ currentStreak, longestStreak, updatedAt: new Date() });
  } catch (e) {
    logger.error(`Failed to update streak for user ${uid}: ${e}`);
  }

  logger.info(`Progress: Day ${dayNumber} uncompleted for user ${uid}`);
};

// ─── Record Event RSVP ────────────────────────────────────────────────────────

export const recordEventRSVP = async (
  uid: string,
  event: { id: string; title: string }
): Promise<void> => {
  const userRef = db.collection('users').doc(uid);
  const eventParticipationRef = userRef.collection('event_participation').doc(event.id);
  const activityRef = userRef.collection('activity_log').doc(createId());

  const now = new Date();

  const existingParticipation = await eventParticipationRef.get();
  if (existingParticipation.exists) {
    // Already RSVP'd
    return;
  }

  const participationDoc: EventParticipationDoc = {
    eventId: event.id,
    title: event.title,
    status: 'RSVP',
    registeredAt: now,
  };

  const activityEntry: ActivityLogEntry = {
    id: activityRef.id,
    type: 'EVENT_RSVP',
    title: `RSVP'd to: ${event.title}`,
    description: `Registered for the event`,
    timestamp: now,
  };

  const batch = db.batch();
  batch.set(eventParticipationRef, participationDoc);
  batch.set(activityRef, activityEntry);
  await batch.commit();

  logger.info(`Progress: Event RSVP recorded for user ${uid}, event ${event.id}`);
};

// ─── Mark Event Attended ──────────────────────────────────────────────────────

export const markEventAttended = async (
  uid: string,
  eventId: string
): Promise<void> => {
  const userRef = db.collection('users').doc(uid);
  const summaryRef = userRef.collection('summary').doc('data');
  const eventParticipationRef = userRef.collection('event_participation').doc(eventId);
  const leaderboardRef = db.collection('leaderboard').doc(uid);
  const activityRef = userRef.collection('activity_log').doc(createId());

  await db.runTransaction(async (transaction) => {
    const participationDoc = await transaction.get(eventParticipationRef);
    if (!participationDoc.exists) {
      throw Object.assign(new Error('User has no RSVP for this event'), { statusCode: 404 });
    }

    const participation = fromFirestore(participationDoc.data()!) as EventParticipationDoc;
    if (participation.status === 'ATTENDED') {
      // Already marked attended
      return;
    }

    const summary = await getOrInitSummary(transaction, summaryRef);
    const now = new Date();

    transaction.update(eventParticipationRef, {
      status: 'ATTENDED',
      attendedAt: now,
    });

    const updatedSummary: UserSummary = {
      ...summary,
      eventsAttended: summary.eventsAttended + 1,
      updatedAt: now,
    };
    updatedSummary.memberScore = calculateMemberScore(updatedSummary);
    transaction.set(summaryRef, updatedSummary);

    transaction.set(leaderboardRef, {
      uid,
      displayName: updatedSummary.displayName,
      avatar: updatedSummary.avatar,
      totalPoints: updatedSummary.totalPoints,
      ctfSolves: updatedSummary.ctfSolves,
      daysCompleted: updatedSummary.daysCompleted,
      eventsAttended: updatedSummary.eventsAttended,
      memberScore: updatedSummary.memberScore,
      currentStreak: updatedSummary.currentStreak,
      longestStreak: updatedSummary.longestStreak,
      updatedAt: now,
    });

    const activityEntry: ActivityLogEntry = {
      id: activityRef.id,
      type: 'EVENT_ATTEND',
      title: `Attended: ${participation.title}`,
      description: `Marked as attended — +50 member score`,
      points: 50,
      timestamp: now,
    };
    transaction.set(activityRef, activityEntry);
  });

  logger.info(`Progress: Event attendance marked for user ${uid}, event ${eventId}`);
};

// ─── Get User Progress ────────────────────────────────────────────────────────

export const getUserProgress = async (uid: string) => {
  const userRef = db.collection('users').doc(uid);

  const [summaryDoc, activitySnapshot, solvesSnapshot, daysSnapshot, eventsSnapshot] = await Promise.all([
    userRef.collection('summary').doc('data').get(),
    userRef.collection('activity_log').orderBy('timestamp', 'desc').limit(10).get(),
    userRef.collection('ctf_solves').get(),
    userRef.collection('days').orderBy('dayNumber', 'asc').get(),
    userRef.collection('event_participation').get(),
  ]);

  const summary: UserSummary | null = summaryDoc.exists
    ? fromFirestore(summaryDoc.data()!) as UserSummary
    : null;

  const activityLog = activitySnapshot.docs.map(doc => fromFirestore(doc.data()) as ActivityLogEntry);
  const ctfSolves = solvesSnapshot.docs.map(doc => fromFirestore(doc.data()) as CTFSolveDoc);
  const days = daysSnapshot.docs.map(doc => fromFirestore(doc.data()) as DayDoc);
  const eventParticipation = eventsSnapshot.docs.map(doc => fromFirestore(doc.data()) as EventParticipationDoc);

  return {
    summary,
    activityLog,
    ctfSolves,
    days,
    eventParticipation,
  };
};

// ─── Get User Progress (Admin) ────────────────────────────────────────────────

export const getUserProgressAdmin = async (uid: string) => {
  // Same as getUserProgress but callable for any UID (ADMIN only via route guard)
  return getUserProgress(uid);
};

// ─── Get All Users Progress (Leaderboard) ────────────────────────────────────

export const getAllUsersProgress = async (limit: number = 100): Promise<LeaderboardEntry[]> => {
  const snapshot = await db
    .collection('leaderboard')
    .orderBy('memberScore', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc, index) => ({
    ...fromFirestore(doc.data()) as LeaderboardEntry,
    rank: index + 1,
  }));
};

// ─── Recalculate Leaderboard (Admin) ────────────────────────────────────────

export const updateLeaderboard = async (): Promise<void> => {
  // In a real scenario, this would re-tally points from all collections for every user.
  // For now, it's a stub to satisfy the endpoint.
  logger.info('Leaderboard recalculation triggered by admin.');
};
