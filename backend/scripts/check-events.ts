import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function checkEvents() {
  const snapshot = await db.collection('events').get();
  console.log(`Found ${snapshot.size} events`);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Event: ${data.title}`);
    console.log(` - ID: ${doc.id}`);
    console.log(` - Date: ${data.date?.toDate()}`);
    console.log(` - isPublished: ${data.isPublished}`);
  });
}

checkEvents().catch(console.error);
