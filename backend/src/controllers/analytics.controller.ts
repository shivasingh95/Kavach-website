import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getPublicStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getPublicStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
