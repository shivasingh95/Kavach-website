import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progress.service';
import { logger } from '../utils/logger';
import { db } from '../utils/firebase-admin';

// ─── GET /progress/me ─────────────────────────────────────────────────────────

export const getMyProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.user!.id;
    const progress = await progressService.getUserProgress(uid);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /progress/leaderboard ────────────────────────────────────────────────

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await progressService.getAllUsersProgress(limit);

    res.json({
      success: true,
      data: { leaderboard },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /progress/users/:uid ─────────────────────────────────────────────────

export const getUserProgressAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    const progress = await progressService.getUserProgressAdmin(uid);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /progress/days/:dayNumber ──────────────────────────────────────────

export const toggleDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.user!.id;
    const dayNumber = parseInt(req.params.dayNumber);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 100) {
      return res.status(400).json({
        success: false,
        error: 'Day number must be between 1 and 100',
      });
    }

    const { roomName, platform } = req.body as { roomName?: string; platform?: string };

    // Check if day is already completed — if so, uncomplete it
    const dayDoc = await db
      .collection('users')
      .doc(uid)
      .collection('days')
      .doc(String(dayNumber))
      .get();

    if (dayDoc.exists) {
      await progressService.recordDayUncomplete(uid, dayNumber);
      return res.json({
        success: true,
        data: { completed: false, dayNumber },
        message: `Day ${dayNumber} marked as incomplete`,
      });
    } else {
      if (!roomName) {
        return res.status(400).json({
          success: false,
          error: 'roomName is required when completing a day',
        });
      }
      await progressService.recordDayComplete(uid, dayNumber, roomName, platform || 'TryHackMe');
      return res.json({
        success: true,
        data: { completed: true, dayNumber },
        message: `Day ${dayNumber} marked as complete!`,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── POST /progress/events/:eventId/attend ────────────────────────────────────

export const markEventAttended = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;
    const { uid } = req.body as { uid: string };

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'uid is required in request body',
      });
    }

    await progressService.markEventAttended(uid, eventId);

    res.json({
      success: true,
      message: `User ${uid} marked as attended for event ${eventId}`,
    });
  } catch (error) {
    next(error);
  }
};
