import { Request, Response, NextFunction } from 'express';
import * as ctfService from '../services/ctf.service';
import { logger } from '../utils/logger';

export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challenge = await ctfService.createChallenge(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { challenge },
      message: 'Challenge created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const challenges = await ctfService.getAllChallenges(isAdmin);
    res.status(200).json({
      success: true,
      data: { challenges, total: challenges.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getChallengeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const challenge = await ctfService.getChallengeById(req.params.id, isAdmin);

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found', statusCode: 404 });
    }

    res.status(200).json({ success: true, data: { challenge } });
  } catch (error) {
    next(error);
  }
};

export const updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ctfService.updateChallenge(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Challenge updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ctfService.deleteChallenge(req.params.id);
    res.status(200).json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctfService.submitFlag(req.user!.id, req.body.challengeId, req.body.flag);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = await ctfService.getLeaderboard(limit);
    res.status(200).json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};

export const getMySubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await ctfService.getUserSubmissions(req.user!.id);
    res.status(200).json({ success: true, data: { submissions } });
  } catch (error) {
    next(error);
  }
};

export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
    const submissions = await ctfService.getAllSubmissions(status);
    res.status(200).json({ success: true, data: { submissions } });
  } catch (error) {
    next(error);
  }
};

export const reviewSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ctfService.reviewSubmission(req.params.id, req.user!.id, {
      status: req.body.status,
      reviewNote: req.body.reviewNote
    });
    res.status(200).json({ success: true, message: 'Submission reviewed successfully' });
  } catch (error) {
    next(error);
  }
};
