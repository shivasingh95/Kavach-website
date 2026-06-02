import { Request, Response, NextFunction } from 'express';

export const rbac = (requiredRole: 'ADMIN' | 'MEMBER' | 'PUBLIC') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ success: false, error: 'Access denied: No role assigned', statusCode: 403 });
    }

    const roles = ['PUBLIC', 'MEMBER', 'ADMIN'];
    const requiredRoleIndex = roles.indexOf(requiredRole);
    const userRoleIndex = roles.indexOf(userRole);

    if (userRoleIndex < requiredRoleIndex) {
      return res.status(403).json({ success: false, error: 'Access denied: Insufficient permissions', statusCode: 403 });
    }

    next();
  };
};
