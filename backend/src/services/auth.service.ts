import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const prisma = new PrismaClient();

export const registerUser = async (data: z.infer<typeof registerSchema>['body']) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  
  if (existingUser) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: 'PUBLIC'
    }
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const loginUser = async (data: z.infer<typeof loginSchema>['body'], ip: string, userAgent: string) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: ip,
      userAgent: userAgent
    }
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { isRevoked: true }
  });
};
