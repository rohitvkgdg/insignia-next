"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma, EventCategory } from "@prisma/client"
import { ApiError } from "@/lib/utils"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

type Category = EventCategory

const eventSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  category: z.nativeEnum(EventCategory, {
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

    const event = await prisma.event.create({
      data: {
        ...validatedData,
        createdById: userId,
      },
    })

    return { success: true, data: event }
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
    const event = await prisma.event.findUnique({
      where: { id },
      select: { createdById: true },
    })

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    if (event.createdById !== userId) {
      throw new ApiError(403, "Not authorized to update this event")
    }

    const validatedData = eventSchema.partial().parse(data)

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validatedData,
    })

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
    const event = await prisma.event.findUnique({
      where: { id },
      select: { createdById: true },
    })

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    if (event.createdById !== userId) {
      throw new ApiError(403, "Not authorized to delete this event")
    }

    await prisma.event.delete({
      where: { id },
    })

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
    const where = {
      ...(category && { category }),
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          createdBy: {
            select: {
              name: true,
              image: true,
            },
          },
          registrations: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ])

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
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    return { data: event }
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
    // Validate input
    const validatedData = registrationSchema.parse({ eventId, notes });
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new ApiError(401, "Not authenticated")
    }
    
    const userId = session.user.id
    
    // Check if user profile is complete
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileCompleted: true, id: true }
    });
    
    if (!user) {
      throw new ApiError(404, "User not found")
    }
    
    if (!user.profileCompleted) {
      throw new ApiError(400, "Please complete your profile before registering for events", "INCOMPLETE_PROFILE")
    }
    
    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: validatedData.eventId,
        },
      },
    })
    
    if (existingRegistration) {
      throw new ApiError(400, "Already registered for this event", "ALREADY_REGISTERED")
    }
    
    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      select: { 
        capacity: true,
        fee: true,
        title: true,
        date: true,
        _count: {
          select: { registrations: true }
        }
      },
    })
    
    if (!event) {
      throw new ApiError(404, "Event not found")
    }
    
    // Check if event is at capacity
    if (event._count.registrations >= event.capacity) {
      throw new ApiError(400, "This event has reached maximum capacity", "EVENT_FULL")
    }
    
    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: validatedData.eventId,
        notes: validatedData.notes,
        status: "PENDING" // Default status
      },
    })
    
    // If event has a fee, create a payment record
    if (event.fee > 0) {
      await prisma.payment.create({
        data: {
          registrationId: registration.id,
          amount: event.fee,
          status: "UNPAID", // Default status
        }
      })
    }
    
    return { 
      success: true, 
      data: registration,
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