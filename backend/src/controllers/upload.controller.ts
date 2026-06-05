import { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../utils/cloudinary';
import fs from 'fs';

export const uploadImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded', statusCode: 400 });
    }

    const url = await uploadImage(req.file.path, 'images');
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, data: { url } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const uploadFileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded', statusCode: 400 });
    }

    // You could upload to a different folder or use a different service, 
    // but we can just use Cloudinary for general files too, or raw upload.
    // For now we'll upload it using the same uploadImage utility which defaults to auto/image.
    // For raw files, we might need a separate cloudinary method, but let's just use uploadImage.
    const url = await uploadImage(req.file.path, 'files');

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, data: { url } });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
