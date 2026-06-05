import { Request, Response, NextFunction } from 'express';
import * as contactService from '../services/contact.service';

export const submitContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactMessage = await contactService.submitContact(req.body);
    res.status(201).json({
      success: true,
      data: contactMessage,
      message: 'Message sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    next(error);
  }
};
