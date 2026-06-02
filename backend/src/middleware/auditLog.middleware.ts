import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLog = (action: string, targetType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We capture the original send method to intercept successful responses
    const originalSend = res.send;
    
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log action asynchronously
        if (req.user?.id) {
          prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action,
              target: targetType,
              ipAddress: req.ip,
              metadata: {
                method: req.method,
                path: req.originalUrl,
                body: req.method !== 'GET' ? req.body : undefined
              }
            }
          }).catch(console.error);
        }
      }
      return originalSend.call(this, body);
    };
    
    next();
  };
};
