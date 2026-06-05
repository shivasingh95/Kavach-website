import { config } from 'dotenv';
config(); // Load variables from .env

import bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { db } from './src/utils/firebase-admin';

async function seedMember() {
  const email = 'shiva@gmail.com';
  const name = 'shiva';
  const password = 'Shiva@gmail.com';

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  
  // Check if user already exists
  const existing = await db.collection('users').where('email', '==', email).get();
  let id = createId();
  
  if (!existing.empty) {
    id = existing.docs[0].id;
    console.log(`User ${email} already exists. Updating role and password.`);
    
    await db.collection('users').doc(id).update({
      passwordHash,
      role: 'MEMBER',
      name,
      updatedAt: now,
    });
  } else {
    console.log(`Creating new user ${email}.`);
    const user = {
      id,
      email,
      name,
      passwordHash,
      role: 'MEMBER',
      isVerified: true,
      isActive: true,
      totalPoints: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('users').doc(id).set(user);
  }

  console.log(`Successfully seeded user ${email} with role MEMBER.`);
  process.exit(0);
}

seedMember().catch(err => {
  console.error('Error seeding user:', err);
  process.exit(1);
});
