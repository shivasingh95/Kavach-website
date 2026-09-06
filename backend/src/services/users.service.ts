import admin, { db } from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';
import type { User, PublicUser, Role } from '../types/models';

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

const toPublicUser = (user: User): PublicUser => {
  const { passwordHash, verifyToken, resetToken, resetExpiry, ...pub } = user;
  return pub;
};

// ─── Update Own Profile ─────────────────────────────────────────────────────

export const updateProfile = async (
  userId: string,
  data: Partial<{
    name: string;
    bio: string;
    github: string;
    linkedin: string;
  }>
): Promise<PublicUser> => {
  const updateData: any = { ...data, updatedAt: new Date() };
  
  // Clean empty strings for optional URL fields
  if (updateData.github === '') delete updateData.github;
  if (updateData.linkedin === '') delete updateData.linkedin;

  await db.collection('users').doc(userId).update(updateData);
  logger.info(`User profile updated: ${userId}`);

  const userDoc = await db.collection('users').doc(userId).get();
  return toPublicUser(fromFirestore(userDoc.data()!) as User);
};

// ─── Update User Role (Admin) ───────────────────────────────────────────────

export const updateUserRole = async (
  userId: string,
  role: Role
): Promise<void> => {
  await db.collection('users').doc(userId).update({
    role,
    updatedAt: new Date()
  });
  logger.info(`User role updated: ${userId} -> ${role}`);
};

// ─── Get All Users (Admin) ──────────────────────────────────────────────────

export const getAllUsers = async (
  page: number = 1,
  limit: number = 20
): Promise<{ users: PublicUser[]; totalPages: number; currentPage: number }> => {
  const countSnapshot = await db.collection('users').count().get();
  const total = countSnapshot.data().count;
  const totalPages = Math.ceil(total / limit);

  const offset = (page - 1) * limit;

  const snapshot = await db.collection('users')
    .orderBy('createdAt', 'desc')
    .offset(offset)
    .limit(limit)
    .get();

  const users = snapshot.docs.map(doc => toPublicUser(fromFirestore(doc.data()) as User));

  return { users, totalPages, currentPage: page };
};

// ─── Get User Profile By ID ─────────────────────────────────────────────────

export const getUserProfile = async (
  userId: string
): Promise<PublicUser | null> => {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) return null;

  return toPublicUser(fromFirestore(doc.data()!) as User);
};

// ─── Toggle User Active (Admin) ─────────────────────────────────────────────

export const toggleUserActive = async (userId: string): Promise<boolean> => {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) throw new Error('User not found');
  
  const currentStatus = doc.data()?.isActive ?? true;
  await db.collection('users').doc(userId).update({
    isActive: !currentStatus,
    updatedAt: new Date()
  });
  
  logger.info(`User active status toggled: ${userId} -> ${!currentStatus}`);
  return !currentStatus;
};

// ─── Delete User (Admin) ────────────────────────────────────────────────────

export const deleteUser = async (userId: string): Promise<void> => {
  await db.collection('users').doc(userId).delete();
  logger.info(`User deleted: ${userId}`);
};

// ─── Create User (Admin) ────────────────────────────────────────────────────

export const createUser = async (
  name: string,
  email: string,
  role: Role = 'MEMBER'
): Promise<PublicUser> => {
  // Check if a user with this email already exists
  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    throw Object.assign(new Error('A user with this email already exists'), { statusCode: 409 });
  }

  // Create Firebase Auth user
  let firebaseUid: string;
  try {
    const authUser = await admin.auth().createUser({
      email,
      displayName: name,
      emailVerified: false,
    });
    firebaseUid = authUser.uid;
    logger.info(`Created Firebase Auth user for admin-created account: ${email}`);
  } catch (err: any) {
    // If auth user already exists, get their UID
    if (err.code === 'auth/email-already-exists') {
      const existingAuth = await admin.auth().getUserByEmail(email);
      firebaseUid = existingAuth.uid;
    } else {
      throw err;
    }
  }

  // Create Firestore user document
  const id = createId();
  const now = new Date();
  const userData = {
    id,
    email,
    name,
    passwordHash: '', // Firebase Auth manages the password
    role,
    isVerified: false,
    isActive: true,
    totalPoints: 0,
    firebaseUid,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').doc(id).set(userData);
  logger.info(`Admin created user: ${email} with role: ${role}`);

  // Generate a password-reset link so the new user can set their own password
  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    });

    await sendEmail(
      email,
      '🔐 You\'ve been added to Kavach — Set Your Password',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050816; color: #ffffff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #00f0ff; margin-bottom: 8px;">Welcome to Kavach, ${name}!</h1>
        <p style="color: #94a3b8; margin-bottom: 24px;">An administrator has created an account for you on the Kavach platform with <strong style="color: #00f0ff;">${role}</strong> access.</p>
        
        <p style="color: #cbd5e1; margin-bottom: 16px;">Please set your password to activate your account:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="display: inline-block; background: #00f0ff; color: #000000; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
            Set Your Password
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">This link expires in 24 hours. If you weren't expecting this, please contact the Kavach admin team.</p>
        
        <hr style="border: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px; text-align: center;">Kavach Cybersecurity Club · Defend. Learn. Hack.</p>
      </div>
      `
    );
    logger.info(`Password setup email sent to ${email}`);
  } catch (err) {
    logger.error({ err }, `Failed to send password setup email to ${email}`);
    // Don't fail — user is created, email is best-effort
  }

  return toPublicUser(userData as unknown as User);
};
