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
