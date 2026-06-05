import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from '../src/utils/firebase-admin';
import * as authService from '../src/services/auth.service';

async function setAdmin() {
  const email = 'admin@gmail.com';
  
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  let userId = '';
  
  if (snapshot.empty) {
    console.log(`User ${email} not found. Creating...`);
    const user = await authService.registerUser({
      email,
      name: 'rohit',
      password: 'Shiva@123'
    });
    userId = user.id;
    console.log(`User created with ID: ${userId}`);
  } else {
    userId = snapshot.docs[0].id;
    console.log(`User ${email} found with ID: ${userId}`);
  }

  await db.collection('users').doc(userId).update({
    role: 'ADMIN',
    name: 'rohit'
  });
  
  console.log(`Successfully set ${email} to ADMIN with name 'rohit'.`);
  process.exit(0);
}

setAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
