import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const _db: FirebaseFirestore.Firestore | null = null;

const initFirebase = () => {
  if (admin.apps.length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r');
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath) {
    try {
      const serviceAccount = JSON.parse(
        fs.readFileSync(path.resolve(serviceAccountPath), 'utf8')
      );
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      logger.info(`Firebase Admin initialized from service account file for project: ${serviceAccount.project_id}`);
      return;
    } catch (err) {
      logger.error({ err }, 'Failed to initialize Firebase Admin from service account file');
      return;
    }
  }

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

if (db) {
  db.settings({ ignoreUndefinedProperties: true });
}

export default admin;
