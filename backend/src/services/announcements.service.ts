import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
import type { Announcement, Role } from '../types/models';

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

export const createAnnouncement = async (
  data: {
    title: string;
    body: string;
    isPinned?: boolean;
    targetRole?: Role;
    expiresAt?: string | Date;
  },
  createdById: string
): Promise<Announcement> => {
  const now = new Date();
  const id = createId();

  const announcement: Announcement = {
    id,
    title: data.title,
    body: data.body,
    isPinned: data.isPinned ?? false,
    targetRole: data.targetRole,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    createdById,
    createdAt: now,
  };

  await db.collection('announcements').doc(id).set(announcement);
  logger.info(`Announcement created: ${data.title} (${id})`);
  return announcement;
};

export const getAnnouncements = async (
  userRole?: Role
): Promise<Announcement[]> => {
  // Simple fetch all and filter in memory since volume is low and Firestore doesn't 
  // support complex OR queries easily without multiple queries.
  // We want to fetch announcements where targetRole is NULL OR targetRole <= userRole.
  
  const snapshot = await db.collection('announcements')
    .orderBy('createdAt', 'desc')
    .get();

  const now = new Date();
  const allAnnouncements = snapshot.docs.map(doc => fromFirestore(doc.data()) as Announcement);

  const roles = ['PUBLIC', 'MEMBER', 'ADMIN'];
  const userRoleIndex = userRole ? roles.indexOf(userRole) : 0; // Default to PUBLIC

  return allAnnouncements.filter(ann => {
    // Check expiry
    if (ann.expiresAt && ann.expiresAt < now) return false;

    // Check role visibility
    if (!ann.targetRole) return true; // Visible to everyone

    const targetRoleIndex = roles.indexOf(ann.targetRole);
    return userRoleIndex >= targetRoleIndex;
  }).sort((a, b) => {
    // Pinned items first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await db.collection('announcements').doc(id).delete();
  logger.info(`Announcement deleted: ${id}`);
};
