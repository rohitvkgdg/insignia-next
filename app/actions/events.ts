"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { ApiError, generateRegistrationId } from "@/lib/server-utils"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { eventCategoryEnum } from '@/schema'
import { eq, desc, and, ilike, or, sql, count } from 'drizzle-orm'
import { event, registration, user, teamMember } from '@/schema'
import { randomUUID } from "crypto"
import { revalidatePath, revalidateTag } from "next/cache"
import { unstable_cache } from 'next/cache'

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
  fee: z.number()
    .min(0, "Fee cannot be negative")
    .max(100000, "Fee must be 100,000 or less"),
  details: z.string()
    .min(10, "Details must be at least 10 characters")
    .max(5000, "Details must be 5000 characters or less"),
  isTeamEvent: z.boolean().default(false),
  minTeamSize: z.number().nullable()
    .refine(val => !val || val >= 2, "Minimum team size must be at least 2")
    .optional(),
  maxTeamSize: z.number().nullable()
    .refine(val => !val || val >= 2, "Maximum team size must be at least 2")
    .optional(),
  image: z.string()
    .url("Please provide a valid image URL")
    .optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

// Registration schema for validating event registration
const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  usn: z.string().min(3, "USN must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

const registrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

export async function createEvent(data: EventFormData, userId: string) {
  try {
    // Validate the input data with better error handling
    let validatedData;
    try {
      validatedData = eventSchema.parse({
        ...data,
        // Ensure numeric fields are properly typed
        fee: Number(data.fee),
        minTeamSize: data.isTeamEvent ? Number(data.minTeamSize) : null,
        maxTeamSize: data.isTeamEvent ? Number(data.maxTeamSize) : null,
        // Handle optional image
        image: data.image || undefined
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new ApiError(400, `Invalid event data: ${errorMessages}`, "VALIDATION_ERROR");
      }
      throw validationError;
    }

    // Get the current highest ID
    const highestEvent = await db.query.event.findFirst({
      orderBy: [desc(event.id)],
    });
    
    const nextId = highestEvent 
      ? (parseInt(highestEvent.id) + 1).toString().padStart(2, '0')
      : "01";

    // Create the event with validated data
    const [newEvent] = await db.insert(event)
      .values({
        id: nextId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        date: new Date(validatedData.date),
        time: validatedData.time,
        location: validatedData.location,
        fee: validatedData.fee,
        details: validatedData.details,
        image: validatedData.image,
        isTeamEvent: validatedData.isTeamEvent,
        minTeamSize: validatedData.isTeamEvent ? validatedData.minTeamSize : null,
        maxTeamSize: validatedData.isTeamEvent ? validatedData.maxTeamSize : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newEvent) {
      throw new ApiError(500, "Failed to create event - No event returned");
    }

    // Invalidate caches
    revalidateTag('events')
    revalidatePath('/events');
    revalidatePath('/admin');

    return { success: true, data: newEvent };
  } catch (error) {
    // Log the full error in production for debugging
    console.error("Create event error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    // Handle any other unexpected errors
    throw new ApiError(500, "Failed to create event: " + (error instanceof Error ? error.message : "Unknown error"));
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
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    if (!updatedEvent) {
      throw new ApiError(500, "Failed to update event")
    }

    // Invalidate caches
    revalidateTag('events')
    revalidateTag(`event-${id}`)
    revalidatePath('/events');
    revalidatePath('/admin');
    revalidatePath(`/events/${id}`);

    return { success: true, data: updatedEvent }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid event data: " + error.errors.map(e => e.message).join(", "))
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

    // Invalidate caches
    revalidateTag('events')
    revalidateTag(`event-${id}`)
    revalidatePath('/events');
    revalidatePath('/admin');

    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Delete event error:", error)
    throw new ApiError(500, "Failed to delete event")
  }
}

export const getEvents = unstable_cache(
  async (
    page = 1, 
    limit = 10,
    category?: Category,
    searchQuery?: string
  ) => {
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
  },
  ['events-list'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['events']
  }
)

export const getEventById = unstable_cache(
  async (id: string) => {
    try {
      const eventData = await db.query.event.findFirst({
        where: eq(event.id, id),
        with: {
          registrations: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
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
  },
  ['event-details'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['events'] // Just use the events tag since we'll revalidate all events together
  }
)

export async function registerForEvent(eventId: string, notes?: string, teamMembers?: { name: string; usn: string; phone: string; }[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" }
    }
    
    const userId = session.user.id
    
    // Get user data for team leader info and verify profile completion
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        numericId: true,
        name: true,
        usn: true,
        phone: true,
        profileCompleted: true
      }
    });
    
    if (!userData) {
      return { success: false, error: "User not found", code: "USER_NOT_FOUND" }
    }

    // Verify profile completion consistently
    const hasRequiredFields = Boolean(
      userData.name?.trim() && 
      userData.usn?.trim() && 
      userData.phone?.trim()
    );

    if (!userData.profileCompleted || !hasRequiredFields) {
      return { success: false, error: "Please complete your profile first", code: "INCOMPLETE_PROFILE" }
    }

    const validatedData = registrationSchema.parse({ eventId, notes, teamMembers });
    
    // Check if already registered
    const existingRegistration = await db.query.registration.findFirst({
      where: and(
        eq(registration.userId, userId),
        eq(registration.eventId, validatedData.eventId)
      )
    });
    
    if (existingRegistration) {
      return { success: false, error: "Already registered for this event", code: "ALREADY_REGISTERED" }
    }
    
    // Check if event exists and get its details
    const eventData = await db.query.event.findFirst({
      where: eq(event.id, validatedData.eventId),
      columns: {
        fee: true,
        title: true,
        date: true,
        isTeamEvent: true,
        minTeamSize: true,
        maxTeamSize: true,
      }
    });
    
    if (!eventData) {
      return { success: false, error: "Event not found", code: "EVENT_NOT_FOUND" }
    }

    // Validate team size including the team leader
    if (eventData.isTeamEvent) {
      if (!teamMembers) {
        return { success: false, error: "Team members are required for this event", code: "TEAM_REQUIRED" }
      }

      const totalTeamSize = teamMembers.length + 1 // Add 1 for team leader
      if (totalTeamSize < (eventData.minTeamSize || 2)) {
        return { success: false, error: `Minimum team size is ${eventData.minTeamSize} (including team leader)`, code: "INVALID_TEAM_SIZE" }
      }
      if (totalTeamSize > (eventData.maxTeamSize || 5)) {
        return { success: false, error: `Maximum team size is ${eventData.maxTeamSize} (including team leader)`, code: "INVALID_TEAM_SIZE" }
      }
    }

    // Generate registration ID using numericId
    const registrationId = await generateRegistrationId(eventId, userId)
    
    // Start a transaction to create registration and team members
    await db.transaction(async (tx) => {
      // Create registration
      const [newRegistration] = await tx.insert(registration)
        .values({
          id: randomUUID(),
          registrationId,
          userId: userData.id,
          eventId: validatedData.eventId,
          paymentStatus: "UNPAID",
          notes: validatedData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // If it's a team event, create team members including the team leader
      if (eventData.isTeamEvent && teamMembers) {
        // First insert team leader
        await tx.insert(teamMember).values({
          id: randomUUID(),
          registrationId: registrationId,
          name: userData.name!,
          usn: userData.usn!,
          phone: userData.phone!,
          createdAt: new Date(),
          updatedAt: new Date(),
          isTeamLeader: true
        });

        // Then insert other team members
        await tx.insert(teamMember)
          .values(
            teamMembers.map(member => ({
              id: randomUUID(),
              registrationId: registrationId,
              name: member.name,
              usn: member.usn,
              phone: member.phone,
              createdAt: new Date(),
              updatedAt: new Date(),
              isTeamLeader: false
            }))
          );
      }
    });

    revalidatePath('/events')
    revalidatePath('/profile')
    revalidatePath(`/events/${eventId}`)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message, code: "VALIDATION_ERROR" }
    }
    console.error("Registration error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to register", code: "REGISTRATION_FAILED" }
  }
}
