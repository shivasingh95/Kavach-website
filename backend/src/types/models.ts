/**
 * TypeScript interfaces that mirror the Prisma schema models.
 * These replace auto-generated Prisma types after migrating to Firestore.
 */

export type Role = 'ADMIN' | 'MEMBER' | 'PUBLIC';
export type CTFCategory = 'WEB' | 'CRYPTO' | 'FORENSICS' | 'PWNING' | 'MISC' | 'OSINT' | 'REVERSE_ENGINEERING';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  avatar?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  isVerified: boolean;
  verifyToken?: string;
  resetToken?: string;
  resetExpiry?: Date;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash' | 'verifyToken' | 'resetToken' | 'resetExpiry'>;

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  date: Date;
  endDate?: Date;
  location?: string;
  imageUrl?: string;
  isPublished: boolean;
  capacity?: number;
  rsvpCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  category: CTFCategory;
  difficulty: Difficulty;
  points: number;
  flagHash: string;
  hints: string[];
  isActive: boolean;
  solveCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CTFSubmission {
  id: string;
  userId: string;
  challengeId: string;
  submittedFlag: string;
  isCorrect: boolean;
  status: SubmissionStatus;
  proofUrl?: string;
  reviewedById?: string;
  reviewNote?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  userId: string;
  eventId?: string;
  createdById: string;
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
  isPublished: boolean;
  viewCount: number;
  readTime: number;
  authorId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  targetRole?: Role;
  expiresAt?: Date;
  createdById: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
