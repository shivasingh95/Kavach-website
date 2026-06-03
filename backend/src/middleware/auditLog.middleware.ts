import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/firebase-admin';

export const auditLog = (action: string, targetType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (req.user?.id) {
          db.collection('auditLogs').add({
            userId: req.user.id,
            action,
            target: targetType,
            ipAddress: req.ip ?? null,
            metadata: {
              method: req.method,
              path: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
            },
            createdAt: new Date(),
          }).catch(console.error);
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
