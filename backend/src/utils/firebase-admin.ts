import admin from 'firebase-admin';
import { logger } from './logger';

let _db: FirebaseFirestore.Firestore | null = null;

const initFirebase = () => {
  if (admin.apps.length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey || privateKey.includes('YOUR_PRIVATE_KEY_HERE')) {
    logger.warn('Firebase Admin credentials not configured — Firestore calls will fail. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    logger.info(`Firebase Admin initialized for project: ${projectId}`);
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Firebase Admin SDK');
  }
};

initFirebase();

export const db = admin.apps.length
  ? admin.firestore()
  : (null as unknown as FirebaseFirestore.Firestore);

export default admin;
