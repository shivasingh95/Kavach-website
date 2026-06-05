import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
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
