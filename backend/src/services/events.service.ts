import { createId } from '@paralleldrive/cuid2';
import { db } from '../utils/firebase-admin';
import { logger } from '../utils/logger';
import type { Event } from '../types/models';

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
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await db.collection('events').where('slug', '==', slug).limit(1).get();
    if (existing.empty) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};

// ─── Create Event (Admin) ───────────────────────────────────────────────────

export const createEvent = async (
  data: {
    title: string;
    description: string;
    content: string;
    date: string | Date;
    endDate?: string | Date;
    location?: string;
    imageUrl?: string;
    isPublished?: boolean;
    capacity?: number;
  },
  createdById: string
): Promise<Event> => {
  const now = new Date();
  const id = createId();
  const slug = await generateSlug(data.title);

  const event: Event = {
    id,
    title: data.title,
    slug,
    description: data.description,
    content: data.content,
    date: new Date(data.date),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    location: data.location,
    imageUrl: data.imageUrl,
    isPublished: data.isPublished ?? false,
    capacity: data.capacity,
    rsvpCount: 0,
    createdById,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('events').doc(id).set(event);
  logger.info(`Event created: ${data.title} (${id})`);
  return event;
};

// ─── Get All Events ─────────────────────────────────────────────────────────

export const getAllEvents = async (
  filters?: {
    includeUnpublished?: boolean;
    limit?: number;
    upcoming?: boolean;
    published?: boolean;
  }
): Promise<Event[]> => {
  // Fetch all events to bypass Firestore composite indexing requirements for combinations
  // of date inequalities, published booleans, and ordering.
  const snapshot = await db.collection('events').get();
  let results = snapshot.docs.map((doc) => fromFirestore(doc.data()) as Event);

  const now = new Date().getTime();

  // 1. Filter by upcoming/past and sort appropriately
  if (filters?.upcoming !== undefined) {
    if (filters.upcoming) {
      results = results.filter(e => e.date.getTime() >= now);
      // Sort ascending (soonest first)
      results.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      // past events
      results = results.filter(e => e.date.getTime() < now);
      // Sort descending (most recent past first)
      results.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  } else {
    // If neither, just sort by date descending
    results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // 2. Filter by isPublished status
  if (!filters?.includeUnpublished || filters.published) {
    results = results.filter(e => e.isPublished === true);
  }

  // 3. Apply limit
  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }
  
  return results;
};

// ─── Get Event By Slug ──────────────────────────────────────────────────────

export const getEventBySlug = async (
  slug: string,
  includeUnpublished: boolean = false
): Promise<Event | null> => {
  let query = db.collection('events').where('slug', '==', slug).limit(1);
  
  if (!includeUnpublished) {
    query = query.where('isPublished', '==', true);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return null;

  return fromFirestore(snapshot.docs[0].data()) as Event;
};

// ─── Update Event (Admin) ───────────────────────────────────────────────────

export const updateEvent = async (
  eventId: string,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    date: string | Date;
    endDate: string | Date;
    location: string;
    imageUrl: string;
    isPublished: boolean;
    capacity: number;
  }>
): Promise<void> => {
  const updateData: any = { ...data, updatedAt: new Date() };

  if (data.title) {
    updateData.slug = await generateSlug(data.title);
  }
  
  if (data.date) updateData.date = new Date(data.date);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  await db.collection('events').doc(eventId).update(updateData);
  logger.info(`Event updated: ${eventId}`);
};

// ─── Delete Event (Admin) ───────────────────────────────────────────────────

export const deleteEvent = async (eventId: string): Promise<void> => {
  await db.collection('events').doc(eventId).delete();
  logger.info(`Event deleted: ${eventId}`);
};

// ─── RSVP System ────────────────────────────────────────────────────────────

export const rsvpEvent = async (eventId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  return await db.runTransaction(async (transaction) => {
    const eventRef = db.collection('events').doc(eventId);
    const rsvpRef = eventRef.collection('rsvps').doc(userId);

    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }

    const event = fromFirestore(eventDoc.data()!) as Event;

    if (!event.isPublished) {
      throw Object.assign(new Error('Event is not published'), { statusCode: 400 });
    }

    const rsvpDoc = await transaction.get(rsvpRef);
    if (rsvpDoc.exists) {
      return { success: true, message: 'You have already RSVP\'d to this event' };
    }

    if (event.capacity && event.rsvpCount >= event.capacity) {
      throw Object.assign(new Error('Event has reached its capacity'), { statusCode: 400 });
    }

    // Add RSVP and update count
    transaction.set(rsvpRef, {
      userId,
      createdAt: new Date()
    });
    
    transaction.update(eventRef, {
      rsvpCount: (event.rsvpCount || 0) + 1
    });

    return { success: true, message: 'RSVP successful' };
  });
};

export const cancelRsvp = async (eventId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  return await db.runTransaction(async (transaction) => {
    const eventRef = db.collection('events').doc(eventId);
    const rsvpRef = eventRef.collection('rsvps').doc(userId);

    const rsvpDoc = await transaction.get(rsvpRef);
    if (!rsvpDoc.exists) {
      return { success: true, message: 'No RSVP found to cancel' };
    }
    
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
        throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    const event = fromFirestore(eventDoc.data()!) as Event;

    // Delete RSVP and update count
    transaction.delete(rsvpRef);
    
    // Ensure rsvpCount doesn't go below 0
    const newCount = Math.max(0, (event.rsvpCount || 0) - 1);
    transaction.update(eventRef, {
      rsvpCount: newCount
    });

    return { success: true, message: 'RSVP cancelled successfully' };
  });
};
