import { db } from '../utils/firebase-admin';
import { createId } from '@paralleldrive/cuid2';
import { logger } from '../utils/logger';

export const submitContact = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const id = createId();
  const contactDoc = {
    id,
    ...data,
    status: 'NEW', // Admin can review and mark as READ
    createdAt: new Date(),
  };

  await db.collection('contacts').doc(id).set(contactDoc);
  logger.info(`New contact message received from ${data.email} (${id})`);
  return contactDoc;
};

export const getAllContacts = async () => {
  const snapshot = await db.collection('contacts').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

export const updateContactStatus = async (id: string, status: string) => {
  const contactRef = db.collection('contacts').doc(id);
  const doc = await contactRef.get();
  
  if (!doc.exists) {
    throw new Error('Contact message not found');
  }

  await contactRef.update({ status });
  logger.info(`Contact message ${id} status updated to ${status}`);
  return { id, status };
};

export const deleteContact = async (id: string) => {
  const contactRef = db.collection('contacts').doc(id);
  const doc = await contactRef.get();
  
  if (!doc.exists) {
    throw new Error('Contact message not found');
  }

  await contactRef.delete();
  logger.info(`Contact message ${id} deleted`);
  return { id };
};
