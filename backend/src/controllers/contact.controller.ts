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

export const getAllContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

export const updateContactStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await contactService.updateContactStatus(id, status);
    res.status(200).json({ success: true, data: result, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    res.status(200).json({ success: true, message: 'Contact message deleted' });
  } catch (error) {
    next(error);
  }
};
