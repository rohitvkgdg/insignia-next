"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Event, Payment } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { authOptions } from "../api/auth/[...nextauth]/route"

export interface RegistrationSummary {
  id: string
  eventId: string
  eventName: string
  date: string
  time: string
  location: string
  fee: number
  status: string
  paymentStatus: string
  createdAt: string
}

export interface UserProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  phone: string | null
  address: string | null
  department: string | null
  semester: number | null
  college: string | null
  usn: string | null
  profileCompleted: boolean
  registrations: RegistrationSummary[]
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().optional().nullable(),
  department: z.string().min(1, "Department is required"),
  semester: z.preprocess((v) => v === "" ? null : Number(v), z.number().int().min(1).max(8).nullable().optional()),
  college: z.string().min(1, "College name is required"),
  usn: z.string().min(1, "USN is required")
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export async function getUserProfile() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      logger.warn("Unauthenticated profile access attempt")
      throw new Error("Not authenticated")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registrations: { include: { event: true, payment: true }, orderBy: { createdAt: "desc" } }
      }
    })
    if (!user) {
      logger.error("User not found in database despite valid session", { email: session.user.email })
      throw new Error("User not found")
    }

    const registrations: RegistrationSummary[] = user.registrations.map((reg: any & {
      event: Event;
      payment: Payment | null;
    }) => ({
      id: reg.id,
      eventId: reg.eventId,
      eventName: reg.event.title,
      date: reg.event.date.toISOString(),
      time: reg.event.time,
      location: reg.event.location,
      fee: reg.event.fee,
      status: reg.status,
      paymentStatus: reg.payment?.status ?? "UNPAID",
      createdAt: reg.createdAt.toISOString(),
    }))

    // Return a plain JavaScript object instead of a NextResponse
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      phone: user.phone,
      address: user.address,
      department: user.department,
      semester: user.semester,
      college: user.college,
      usn: user.usn,
      profileCompleted: user.profileCompleted,
      registrations
    } as UserProfileData
  } catch (err) {
    logger.error("Failed to fetch profile", err instanceof Error ? err : new Error(String(err)))
    throw new Error(err instanceof Error ? err.message : "Failed to fetch profile")
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<void | NextResponse> {
  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    logger.info("Invalid profile update data", { errors: parsed.error.flatten().fieldErrors })
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      logger.warn("Unauthenticated profile update attempt")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Validate if user already exists with the same USN but different email
    if (parsed.data.usn) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          usn: parsed.data.usn,
          email: { not: session.user.email }
        }
      })
      
      if (existingUser) {
        logger.warn("USN conflict during profile update", { 
          usn: parsed.data.usn, 
          requestingEmail: session.user.email 
        })
        return NextResponse.json({ 
          error: "This USN/College ID is already registered with a different account" 
        }, { status: 409 })
      }
    }

    const { department, college, phone, usn } = parsed.data
    const profileCompleted = Boolean(
      department?.trim() && college?.trim() && phone?.trim() && usn?.trim()
    )

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...parsed.data,
        semester: parsed.data.semester ?? null,
        profileCompleted
      }
    })

    logger.info("Profile updated successfully", { email: session.user.email })
    revalidatePath('/profile')
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (err) {
    logger.error("Failed to update profile", err instanceof Error ? err : new Error(String(err)))
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}