import { Request, Response, NextFunction } from 'express';
import * as announcementsService from '../services/announcements.service';
import { Role } from '../types/models';

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await announcementsService.createAnnouncement(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { announcement },
      message: 'Announcement created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role as Role | undefined;
    const announcements = await announcementsService.getAnnouncements(role);
    res.status(200).json({
      success: true,
      data: { announcements },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await announcementsService.deleteAnnouncement(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
