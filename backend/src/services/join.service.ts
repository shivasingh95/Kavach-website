import { db } from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
import crypto from 'crypto';
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
      // Create or upgrade the Firestore account used by the backend login flow.
      const existingFirestoreUser = await db.collection('users').where('email', '==', email).limit(1).get();
      let userId: string;
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
      const setupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (existingFirestoreUser.empty) {
        userId = createId();
        const now = new Date();
        await db.collection('users').doc(userId).set({
          id: userId,
          email,
          name: fullName,
          passwordHash: '', // Filled with a bcrypt hash when the member sets a password
          role: 'MEMBER',
          isVerified: true,
          isActive: true,
          totalPoints: 0,
          resetToken: setupTokenHash,
          resetExpiry: setupExpiry,
          createdAt: now,
          updatedAt: now,
        });
        logger.info(`Created Firestore user for ${email}: ${userId}`);
      } else {
        const existingDoc = existingFirestoreUser.docs[0];
        userId = existingDoc.id;
        await existingDoc.ref.update({
          role: 'MEMBER',
          isActive: true,
          resetToken: setupTokenHash,
          resetExpiry: setupExpiry,
          updatedAt: new Date(),
        });
        logger.info(`Upgraded existing user ${email} to MEMBER`);
      }

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${setupToken}`;

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

      data.userId = userId;
      logger.info(`Successfully provisioned account for ${email}`);
    } catch (err) {
      logger.error({ err }, `Failed to provision account for accepted join request ${id}`);
      // Don't block the status update — just log the error
    }
  }

  if (data.status === 'REJECTED') {
    const email: string = requestData.email;
    const fullName: string = requestData.fullName;
    const reviewNote = data.reviewNote?.trim();

    try {
      await sendEmail(
        email,
        'Kavach membership application update',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050816; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #00f0ff; margin-bottom: 8px;">Hello ${fullName},</h1>
          <p style="color: #cbd5e1; margin-bottom: 24px;">Thank you for your interest in joining Kavach. After reviewing your application, we are unable to accept it at this time.</p>
          ${reviewNote ? `<p style="color: #94a3b8; margin-bottom: 24px;"><strong style="color: #ffffff;">Review note:</strong> ${reviewNote}</p>` : ''}
          <p style="color: #64748b; font-size: 13px;">You are welcome to apply again in a future recruitment cycle.</p>
          <hr style="border: 1px solid #1e293b; margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px; text-align: center;">Kavach Cybersecurity Club · Defend. Learn. Hack.</p>
        </div>
        `
      );
      logger.info(`Rejection email sent to ${email} for join request ${id}`);
    } catch (err) {
      logger.error({ err }, `Failed to send rejection email for join request ${id}`);
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

