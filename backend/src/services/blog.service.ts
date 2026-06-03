import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
import type { BlogPost } from '../types/models';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fromFirestore = (data: FirebaseFirestore.DocumentData): any => {
  const result: any = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val.toDate === 'function') {
      result[key] = val.toDate();
    } else {
      result[key] = val;
    }
  }
  return result;
};

const generateSlug = async (title: string): Promise<string> => {
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await db.collection('blogPosts').where('slug', '==', slug).limit(1).get();
    if (existing.empty) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};

// Rough estimate: ~200 words per minute reading speed
const calculateReadTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
};

// ─── Create Blog Post ───────────────────────────────────────────────────────

export const createPost = async (
  data: {
    title: string;
    content: string;
    excerpt: string;
    tags?: string[];
    coverImage?: string;
    isPublished?: boolean;
  },
  authorId: string
): Promise<BlogPost> => {
  const now = new Date();
  const id = createId();
  const slug = await generateSlug(data.title);
  const readTime = calculateReadTime(data.content);
  const isPublished = data.isPublished ?? false;

  const post: BlogPost = {
    id,
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt,
    tags: data.tags ?? [],
    coverImage: data.coverImage,
    isPublished,
    viewCount: 0,
    readTime,
    authorId,
    publishedAt: isPublished ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('blogPosts').doc(id).set(post);
  logger.info(`Blog post created: ${data.title} (${id})`);
  return post;
};

// ─── Get All Blog Posts ─────────────────────────────────────────────────────

export const getAllPosts = async (
  page: number = 1,
  limit: number = 10,
  includeUnpublished: boolean = false
): Promise<{ posts: BlogPost[]; totalPages: number; currentPage: number }> => {
  let query: FirebaseFirestore.Query = db.collection('blogPosts');

  if (!includeUnpublished) {
    query = query.where('isPublished', '==', true);
  }

  // Get total count for pagination (Firestore count() is cheap)
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;
  const totalPages = Math.ceil(total / limit);

  // Note: For true deep pagination in Firestore, we should use cursors (startAfter).
  // But for a simple blog with page/limit offset calculation, we can just fetch and slice, 
  // OR use offset() which has a read cost proportional to offset. 
  // We'll use offset() here for simplicity since a blog typically doesn't have 10,000+ posts.
  const offset = (page - 1) * limit;

  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .offset(offset)
    .limit(limit)
    .get();

  const posts = snapshot.docs.map((doc) => fromFirestore(doc.data()) as BlogPost);

  return { posts, totalPages, currentPage: page };
};

// ─── Get Blog Post By Slug ──────────────────────────────────────────────────

export const getPostBySlug = async (
  slug: string,
  includeUnpublished: boolean = false
): Promise<BlogPost | null> => {
  let query = db.collection('blogPosts').where('slug', '==', slug).limit(1);
  
  if (!includeUnpublished) {
    query = query.where('isPublished', '==', true);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const post = fromFirestore(doc.data()) as BlogPost;

  // Increment view count asynchronously
  doc.ref.update({ viewCount: FirebaseFirestore.FieldValue.increment(1) }).catch(e => {
     logger.error({ err: e }, `Failed to increment view count for post ${post.id}`);
  });

  // Return the incremented value for immediate reflection
  post.viewCount = (post.viewCount || 0) + 1;

  return post;
};

// ─── Update Blog Post ───────────────────────────────────────────────────────

export const updatePost = async (
  postId: string,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    coverImage: string;
    isPublished: boolean;
  }>
): Promise<void> => {
  const updateData: any = { ...data, updatedAt: new Date() };

  if (data.title) {
    updateData.slug = await generateSlug(data.title);
  }

  if (data.content) {
    updateData.readTime = calculateReadTime(data.content);
  }

  if (data.isPublished === true) {
    updateData.publishedAt = new Date();
  } else if (data.isPublished === false) {
    updateData.publishedAt = null;
  }

  await db.collection('blogPosts').doc(postId).update(updateData);
  logger.info(`Blog post updated: ${postId}`);
};

// ─── Delete Blog Post ───────────────────────────────────────────────────────

export const deletePost = async (postId: string): Promise<void> => {
  await db.collection('blogPosts').doc(postId).delete();
  logger.info(`Blog post deleted: ${postId}`);
};
