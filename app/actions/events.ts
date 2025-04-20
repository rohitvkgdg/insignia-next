"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { ApiError, generateRegistrationId } from "@/lib/server-utils"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { eventCategoryEnum } from '@/schema'
import { eq, desc, and, ilike, or, sql, count } from 'drizzle-orm'
import { event, registration, user } from '@/schema'
import { randomUUID } from "crypto"

type Category = typeof eventCategoryEnum.enumValues[number]

const eventSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  category: z.enum(eventCategoryEnum.enumValues, {
    errorMap: () => ({ message: "Please select a valid event category" })
  }),
  date: z.string()
    .datetime({ message: "Please provide a valid date in ISO format" }),
  time: z.string()
    .min(1, "Event time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*(AM|PM|am|pm))?$/, "Please provide a valid time format (e.g. 14:30 or 2:30 PM)"),
  location: z.string()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location must be 200 characters or less"),
  capacity: z.number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be a positive number")
    .max(10000, "Capacity must be 10,000 or less"),
  fee: z.number()
    .min(0, "Fee cannot be negative")
    .max(100000, "Fee must be 100,000 or less"),
  details: z.string()
    .min(10, "Details must be at least 10 characters")
    .max(5000, "Details must be 5000 characters or less"),
  image: z.string()
    .url("Please provide a valid image URL")
    .optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

// Registration schema for validating event registration
const registrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID format"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

export async function createEvent(data: EventFormData, userId: string) {
  try {
    const validatedData = eventSchema.parse(data)
    const id = randomUUID()

    const [createdEvent] = await db.insert(event)
      .values({
        id,
        ...validatedData,
        date: new Date(validatedData.date),
        fee: validatedData.fee,
        registrationOpen: true,
      })
      .returning();

    return { success: true, data: createdEvent }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid event data", "VALIDATION_ERROR")
    }
    console.error("Create event error:", error)
    throw new ApiError(500, "Failed to create event")
  }
}

export async function updateEvent(id: string, data: Partial<EventFormData>, userId: string) {
  try {
    const existingEvent = await db.query.event.findFirst({
      where: eq(event.id, id)
    });

    if (!existingEvent) {
      throw new ApiError(404, "Event not found")
    }

    const validatedData = eventSchema.partial().parse(data)

    const [updatedEvent] = await db.update(event)
      .set({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      })
      .where(eq(event.id, id))
      .returning();

    return { success: true, data: updatedEvent }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid event data", "VALIDATION_ERROR")
    }
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Update event error:", error)
    throw new ApiError(500, "Failed to update event")
  }
}

export async function deleteEvent(id: string, userId: string) {
  try {
    const existingEvent = await db.query.event.findFirst({
      where: eq(event.id, id)
    });

    if (!existingEvent) {
      throw new ApiError(404, "Event not found")
    }

    await db.delete(event)
      .where(eq(event.id, id));

    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Delete event error:", error)
    throw new ApiError(500, "Failed to delete event")
  }
}

export async function getEvents(
  page = 1, 
  limit = 10,
  category?: Category,
  searchQuery?: string
) {
  try {
    let whereConditions = [];
    
    if (category) {
      whereConditions.push(eq(event.category, category));
    }
    
    if (searchQuery) {
      whereConditions.push(
        or(
          ilike(event.title, `%${searchQuery}%`),
          ilike(event.description, `%${searchQuery}%`)
        )
      );
    }
    
    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;

    // Get events with pagination
    const events = await db.query.event.findMany({
      where: whereClause,
      limit: limit,
      offset: (page - 1) * limit,
      orderBy: [desc(event.date)],
      with: {
        registrations: true,
      },
    });

    // Count total events matching criteria
    const totalResult = await db.select({ count: count() })
      .from(event)
      .where(whereClause || sql`TRUE`);
    
    const total = totalResult[0].count;

    return {
      data: events,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get events error:", error)
    throw new ApiError(500, "Failed to fetch events")
  }
}

export async function getEventById(id: string) {
  try {
    const eventData = await db.query.event.findFirst({
      where: eq(event.id, id),
      with: {
        registrations: {
          with: {
            user: {
              columns: {
                name: true,
                image: true,
              }
            }
          }
        }
      }
    });

    if (!eventData) {
      throw new ApiError(404, "Event not found")
    }

    return { data: eventData }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Get event error:", error)
    throw new ApiError(500, "Failed to fetch event")
  }
}

export async function registerForEvent(eventId: string, notes?: string) {
  try {
    const validatedData = registrationSchema.parse({ eventId, notes });
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new ApiError(401, "Not authenticated")
    }
    
    const userId = session.user.id
    
    // Check if user profile is complete
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        profileCompleted: true,
        id: true
      }
    });
    
    if (!userData) {
      throw new ApiError(404, "User not found")
    }
    
    if (!userData.profileCompleted) {
      throw new ApiError(400, "Please complete your profile before registering for events", "INCOMPLETE_PROFILE")
    }
    
    // Check if already registered
    const existingRegistration = await db.query.registration.findFirst({
      where: and(
        eq(registration.userId, userId),
        eq(registration.eventId, validatedData.eventId)
      )
    });
    
    if (existingRegistration) {
      throw new ApiError(400, "Already registered for this event", "ALREADY_REGISTERED")
    }
    
    // Check if event exists and has capacity
    const eventData = await db.query.event.findFirst({
      where: eq(event.id, validatedData.eventId),
      columns: {
        capacity: true,
        fee: true,
        title: true,
        date: true,
      },
      with: {
        registrations: {
          columns: {
            id: true,
          }
        }
      }
    });
    
    if (!eventData) {
      throw new ApiError(404, "Event not found")
    }
    
    // Check if event is at capacity
    if (eventData.registrations.length >= eventData.capacity) {
      throw new ApiError(400, "This event has reached maximum capacity", "EVENT_FULL")
    }
    
    // Generate registration ID
    const registrationId = await generateRegistrationId(eventId)
    
    // Create registration
    const id = randomUUID()
    const [newRegistration] = await db.insert(registration)
      .values({
        id,
        registrationId,
        userId: userData.id,
        eventId: validatedData.eventId,
        paymentStatus: "UNPAID",
        notes: validatedData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return { 
      success: true, 
      data: newRegistration,
      message: "Successfully registered for the event" 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid registration data", "VALIDATION_ERROR")
    }
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Register for event error:", error)
    throw new ApiError(500, "Failed to register for event")
  }
}
