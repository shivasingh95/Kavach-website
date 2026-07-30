// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

// Map Firestore gRPC status codes to HTTP status codes
function firestoreCodeToStatus(code: string): number {
  const map: Record<string, number> = {
    NOT_FOUND: 404,
    ALREADY_EXISTS: 409,
    PERMISSION_DENIED: 403,
    UNAUTHENTICATED: 401,
    INVALID_ARGUMENT: 400,
    RESOURCE_EXHAUSTED: 429,
    FAILED_PRECONDITION: 422,
    UNIMPLEMENTED: 501,
    UNAVAILABLE: 503,
  };
  return map[code] ?? 500;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // --- 1. Operational errors (thrown explicitly in code) ---
  if (err instanceof AppError) {
    if (!isProduction) logger.warn(`[AppError] ${err.statusCode} — ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      ...(err.field ? { field: err.field } : {}),
    });
    return;
  }

  // --- 2. Zod validation errors ---
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const field = firstIssue?.path.join('.');
    const message = firstIssue?.message ?? 'Validation failed';
    res.status(400).json({
      success: false,
      error: message,
      statusCode: 400,
      field,
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  // --- 3. JWT errors ---
  if (err instanceof Error) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token',
        statusCode: 401,
      });
      return;
    }

    // --- 4. Firestore / gRPC errors ---
    const firestoreErr = err as Error & { code?: string | number; details?: string };
    if (typeof firestoreErr.code === 'string' && firestoreErr.code in {
      NOT_FOUND: 1, ALREADY_EXISTS: 1, PERMISSION_DENIED: 1,
      UNAUTHENTICATED: 1, INVALID_ARGUMENT: 1, RESOURCE_EXHAUSTED: 1,
      FAILED_PRECONDITION: 1, UNIMPLEMENTED: 1, UNAVAILABLE: 1,
    }) {
      const statusCode = firestoreCodeToStatus(firestoreErr.code);
      logger.error(`[Firestore] ${firestoreErr.code}: ${firestoreErr.message}`);
      res.status(statusCode).json({
        success: false,
        error: isProduction
          ? 'A database error occurred'
          : (firestoreErr.details ?? firestoreErr.message),
        statusCode,
      });
      return;
    }

    // --- 5. Multer file upload errors ---
    if (err.name === 'MulterError') {
      res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`,
        statusCode: 400,
      });
      return;
    }

    // --- 6. Unknown / unexpected errors ---
    logger.error(`[UnhandledError] ${err.message}`, { stack: err.stack, path: req.path });
    res.status(500).json({
      success: false,
      error: isProduction ? 'Internal server error' : err.message,
      statusCode: 500,
    });
    return;
  }

  // --- 7. Non-Error thrown (shouldn't happen, but just in case) ---
  logger.error('[UnknownThrow]', err);
  res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
};
