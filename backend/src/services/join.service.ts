import { db } from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
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
