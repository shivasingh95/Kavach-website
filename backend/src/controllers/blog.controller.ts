import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';
import { logger } from '../utils/logger';
import { db } from '../utils/firebase-admin';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await blogService.createPost(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { post },
      message: 'Blog post created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isAdminOrMember = ['ADMIN', 'MEMBER'].includes(req.user?.role || '');

    const result = await blogService.getAllPosts(page, limit, isAdminOrMember);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdminOrMember = ['ADMIN', 'MEMBER'].includes(req.user?.role || '');
    const post = await blogService.getPostBySlug(req.params.slug, isAdminOrMember);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found', statusCode: 404 });
    }

    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check ownership or if ADMIN
    const postDoc = await db.collection('blogPosts').doc(req.params.id).get();
    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found', statusCode: 404 });
    }

    const isOwner = postDoc.data()?.authorId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this post', statusCode: 403 });
    }

    await blogService.updatePost(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Blog post updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check ownership or if ADMIN
    const postDoc = await db.collection('blogPosts').doc(req.params.id).get();
    if (!postDoc.exists) {
      return res.status(404).json({ success: false, error: 'Post not found', statusCode: 404 });
    }

    const isOwner = postDoc.data()?.authorId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied: You do not own this post', statusCode: 403 });
    }

    await blogService.deletePost(req.params.id);
    res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
