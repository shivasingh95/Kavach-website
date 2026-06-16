import bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import type { User, PublicUser, RefreshToken } from '../types/models';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip sensitive fields before returning a user to the client */
const toPublicUser = (user: User): PublicUser => {
  const { passwordHash, verifyToken, resetToken, resetExpiry, ...pub } = user;
  return pub;
};

/** Convert Firestore Timestamps (or plain Date) to JS Dates recursively */
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

// ─── Register ────────────────────────────────────────────────────────────────

export const registerUser = async (
  data: z.infer<typeof registerSchema>['body']
): Promise<PublicUser> => {
  // Check email uniqueness via a collection query
  const existing = await db
    .collection('users')
    .where('email', '==', data.email)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const now = new Date();
  const id = createId();

  const user: User = {
    id,
    email: data.email,
    name: data.name,
    passwordHash,
    role: 'PUBLIC',
    isVerified: false,
    isActive: true,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').doc(id).set(user);

  return toPublicUser(user);
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginUser = async (
  data: z.infer<typeof loginSchema>['body'],
  ip: string,
  userAgent: string
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> => {
  const snapshot = await db
    .collection('users')
    .where('email', '==', data.email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const userDoc = snapshot.docs[0];
  const user = fromFirestore(userDoc.data()) as User;
  if (!user.isActive) {
  throw Object.assign(
    new Error('Your account has been deactivated. Please contact an administrator.'),
    { statusCode: 403 }
  );
}

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  const tokenId = createId();
  const tokenDoc: RefreshToken = {
    id: tokenId,
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
    ipAddress: ip,
    userAgent,
    createdAt: new Date(),
  };

  await db.collection('refreshTokens').doc(tokenId).set(tokenDoc);

  return { user: toPublicUser(user), accessToken, refreshToken };
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logoutUser = async (refreshToken: string): Promise<void> => {
  const snapshot = await db
    .collection('refreshTokens')
    .where('token', '==', refreshToken)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update({ isRevoked: true });
  }
};

// ─── Get user by ID ──────────────────────────────────────────────────────────

export const getUserById = async (userId: string): Promise<PublicUser | null> => {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) return null;
  const user = fromFirestore(doc.data()!) as User;
  return toPublicUser(user);
};

// ─── Refresh Token ──────────────────────────────────────────────────────────

export const refreshAccessToken = async (
  token: string
): Promise<{ accessToken: string }> => {
  try {
    const payload = verifyRefreshToken(token);
    const snapshot = await db
      .collection('refreshTokens')
      .where('token', '==', token)
      .where('isRevoked', '==', false)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('Invalid or revoked refresh token');
    }

    const userDoc = await db.collection('users').doc(payload.id).get();
    if (!userDoc.exists) throw new Error('User not found');
    
    const user = userDoc.data() as User;
    const accessToken = signAccessToken(user.id, user.role);

    return { accessToken };
  } catch (error) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
};

// ─── Google OAuth ────────────────────────────────────────────────────────────

export const loginOrCreateGoogleUser = async (
  idToken: string,
  ip: string,
  userAgent: string
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> => {
  // Verify the Firebase ID token
  const admin = (await import('../utils/firebase-admin')).default;
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const email = decodedToken.email;
  const name = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';

  if (!email) {
    throw Object.assign(new Error('Google account has no email associated'), { statusCode: 400 });
  }

  // Check if user already exists
  const existing = await db
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  let user: User;

  if (!existing.empty) {
    // Existing user — log them in
    user = fromFirestore(existing.docs[0].data()) as User;
  } else {
    // New user — create account (no password needed for Google users)
    const id = createId();
    const now = new Date();
    const randomHash = await bcrypt.hash(createId(), 12); // Random unusable password

    user = {
      id,
      email,
      name,
      passwordHash: randomHash,
      role: 'PUBLIC',
      isVerified: true, // Google accounts are pre-verified
      isActive: true,
      totalPoints: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('users').doc(id).set(user);
  }

  // Generate tokens
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  const tokenId = createId();
  const tokenDoc: RefreshToken = {
    id: tokenId,
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
    ipAddress: ip,
    userAgent,
    createdAt: new Date(),
  };

  await db.collection('refreshTokens').doc(tokenId).set(tokenDoc);

  return { user: toPublicUser(user), accessToken, refreshToken };
};

