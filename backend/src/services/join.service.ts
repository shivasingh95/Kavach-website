import { db } from '../utils/firebase-admin';
import admin from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import type { JoinRequest } from '../types/models';

export const createJoinRequest = async (data: any): Promise<JoinRequest> => {
  const id = createId();
  const now = new Date();
  
  const joinRequest: JoinRequest = {
    ...data,
    id,
    userId: '', // Will be matched or created if accepted
    status: 'PENDING',
    createdAt: now,
  };

  await db.collection('joinRequests').doc(id).set(joinRequest);
  return joinRequest;
};

export const getAllJoinRequests = async (): Promise<JoinRequest[]> => {
  const snapshot = await db.collection('joinRequests').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      reviewedAt: data.reviewedAt?.toDate()
    } as JoinRequest;
  });
};

export const updateJoinRequest = async (id: string, data: any, adminId: string): Promise<JoinRequest> => {
  const docRef = db.collection('joinRequests').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Join request not found');

  const requestData = doc.data()!;

  // ─── Auto-provision account when ACCEPTED ──────────────────────────────
  if (data.status === 'ACCEPTED') {
    const email: string = requestData.email;
    const fullName: string = requestData.fullName;

    try {
      // 1. Check if a Firebase Auth user already exists for this email
      let firebaseUid: string;
      try {
        const existingAuth = await admin.auth().getUserByEmail(email);
        firebaseUid = existingAuth.uid;
        logger.info(`Firebase Auth user already exists for ${email}, using uid: ${firebaseUid}`);
      } catch {
        // User doesn't exist — create them
        const newAuthUser = await admin.auth().createUser({
          email,
          displayName: fullName,
          emailVerified: false,
        });
        firebaseUid = newAuthUser.uid;
        logger.info(`Created Firebase Auth user for ${email}: ${firebaseUid}`);
      }

      // 2. Check if Firestore user doc already exists
      const existingFirestoreUser = await db.collection('users').where('email', '==', email).limit(1).get();
      let userId: string;

      if (existingFirestoreUser.empty) {
        // Create new Firestore user document with MEMBER role
        userId = createId();
        const now = new Date();
        await db.collection('users').doc(userId).set({
          id: userId,
          email,
          name: fullName,
          passwordHash: '', // Firebase Auth manages password
          role: 'MEMBER',
          isVerified: true,
          isActive: true,
          totalPoints: 0,
          firebaseUid,
          createdAt: now,
          updatedAt: now,
        });
        logger.info(`Created Firestore user for ${email}: ${userId}`);
      } else {
        // Upgrade existing user to MEMBER
        const existingDoc = existingFirestoreUser.docs[0];
        userId = existingDoc.id;
        await existingDoc.ref.update({ role: 'MEMBER', isActive: true, updatedAt: new Date() });
        logger.info(`Upgraded existing user ${email} to MEMBER`);
      }

      // 3. Generate a Firebase password-reset link so user can set their password
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      });

      // 4. Send welcome email with the password-set link
      await sendEmail(
        email,
        '🎉 Welcome to Kavach — Set Your Password',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050816; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #00f0ff; margin-bottom: 8px;">Welcome to Kavach, ${fullName}!</h1>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your membership application has been <strong style="color: #06d6a0;">accepted</strong>. You now have MEMBER access to the Kavach platform.</p>
          
          <p style="color: #cbd5e1; margin-bottom: 16px;">To get started, please set your password by clicking the button below:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #00f0ff; color: #000000; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
              Set Your Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 13px;">This link expires in 24 hours. If you didn't apply to Kavach, please ignore this email.</p>
          
          <hr style="border: 1px solid #1e293b; margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px; text-align: center;">Kavach Cybersecurity Club · Defend. Learn. Hack.</p>
        </div>
        `
      );

      // 5. Update the join request doc with the provisioned userId
      data.userId = userId;
      logger.info(`Successfully provisioned account for ${email}`);
    } catch (err) {
      logger.error({ err }, `Failed to provision account for accepted join request ${id}`);
      // Don't block the status update — just log the error
    }
  }

  const updateData = {
    ...data,
    reviewedById: adminId,
    reviewedAt: new Date()
  };

  await docRef.update(updateData);
  const updatedDoc = await docRef.get();
  
  const updatedData = updatedDoc.data()!;
  return {
    ...updatedData,
    createdAt: updatedData.createdAt?.toDate(),
    reviewedAt: updatedData.reviewedAt?.toDate()
  } as JoinRequest;
};

export const deleteJoinRequest = async (id: string): Promise<void> => {
  await db.collection('joinRequests').doc(id).delete();
};

