import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUser = await usersService.updateProfile(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Prevent self-demotion
    if (req.params.id === req.user!.id) {
        return res.status(400).json({ success: false, error: 'Cannot change your own role', statusCode: 400 });
    }

    await usersService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: `User role updated to ${req.body.role}` });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await usersService.getAllUsers(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
