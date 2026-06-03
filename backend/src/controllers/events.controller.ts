import { Request, Response, NextFunction } from 'express';
import * as eventsService from '../services/events.service';
import { logger } from '../utils/logger';

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventsService.createEvent(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { event },
      message: 'Event created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If admin, they can see unpublished events too
    const isAdmin = req.user?.role === 'ADMIN';
    const events = await eventsService.getAllEvents(isAdmin);
    res.status(200).json({
      success: true,
      data: { events, total: events.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const event = await eventsService.getEventBySlug(req.params.slug, isAdmin);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found', statusCode: 404 });
    }

    res.status(200).json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await eventsService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await eventsService.deleteEvent(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const rsvpEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.rsvpEvent(req.params.id, req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelRsvp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await eventsService.cancelRsvp(req.params.id, req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
