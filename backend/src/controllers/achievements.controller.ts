import { Request, Response, NextFunction } from 'express';
import * as achievementsService from '../services/achievements.service';

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achievement = await achievementsService.createAchievement(req.body, req.user!.id);
    res.status(201).json({ success: true, data: { achievement } });
  } catch (error) {
    next(error);
  }
};

export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If not admin, we could filter by isPublished only. 
    // The frontend currently fetches all for admin, and we can just return all or filter based on req.user?.role.
    // For simplicity, we return all, and the frontend filters if needed.
    const achievements = await achievementsService.getAllAchievements();
    res.status(200).json({ success: true, data: { achievements } });
  } catch (error) {
    next(error);
  }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await achievementsService.updateAchievement(req.params.id, req.body);
    res.status(200).json({ success: true, data: { achievement: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await achievementsService.deleteAchievement(req.params.id);
    res.status(200).json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    next(error);
  }
};
