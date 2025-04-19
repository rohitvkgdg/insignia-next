"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma, EventCategory } from "@prisma/client"
import { ApiError } from "@/lib/utils"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

type Category = EventCategory

const eventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.nativeEnum(EventCategory),
  date: z.string().datetime(),
  time: z.string(),
  location: z.string().min(3),
  capacity: z.number().int().positive(),
  fee: z.number().min(0),
  details: z.string(),
  image: z.string().optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

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

export async function registerForEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new ApiError(401, "Not authenticated")
    }
    const userId = session.user.id
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    })
    if (existingRegistration) {
      throw new ApiError(400, "Already registered for this event")
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { capacity: true },
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error("Register for event error:", error)
    throw new ApiError(500, "Failed to register for event")
  }
}