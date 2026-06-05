import { Request, Response, NextFunction } from 'express';
import * as joinService from '../services/join.service';

export const createJoinRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const joinRequest = await joinService.createJoinRequest(req.body);
    res.status(201).json({ success: true, data: { joinRequest } });
  } catch (error) {
    next(error);
  }
};

export const getAllJoinRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await joinService.getAllJoinRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateJoinRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await joinService.updateJoinRequest(req.params.id, req.body, req.user!.id);
    res.status(200).json({ success: true, data: { joinRequest: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteJoinRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await joinService.deleteJoinRequest(req.params.id);
    res.status(200).json({ success: true, message: 'Join request deleted' });
  } catch (error) {
    next(error);
  }
};
