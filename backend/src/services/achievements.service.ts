import { db } from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
import type { Achievement } from '../types/models';

export const createAchievement = async (data: any, adminId: string): Promise<Achievement> => {
  const id = createId();
  const now = new Date();
  
  const achievement: Achievement = {
    ...data,
    id,
    createdById: adminId,
    createdAt: now,
  };

  await db.collection('achievements').doc(id).set(achievement);
  return achievement;
};

export const getAllAchievements = async (): Promise<Achievement[]> => {
  const snapshot = await db.collection('achievements').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      achievedAt: data.achievedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as Achievement;
  });
};

export const updateAchievement = async (id: string, data: any): Promise<Achievement> => {
  const docRef = db.collection('achievements').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Achievement not found');

  await docRef.update(data);
  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data()!;
  
  return {
    ...updatedData,
    achievedAt: updatedData.achievedAt?.toDate(),
    createdAt: updatedData.createdAt?.toDate(),
  } as Achievement;
};

export const deleteAchievement = async (id: string): Promise<void> => {
  await db.collection('achievements').doc(id).delete();
};
