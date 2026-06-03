import jwt, { SignOptions } from 'jsonwebtoken';

export const signAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || '15m') as SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
};
