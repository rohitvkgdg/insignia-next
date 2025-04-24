"use server"

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { eq, and, not } from 'drizzle-orm'
import { user } from '@/schema'
import { updateProfileSchema } from "@/lib/validation"

export interface RegistrationSummary {
  id: string
  eventId: string
  eventName: string
  date: string
  time: string
  location: string
  fee: number
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

// const updateProfileSchema = z.object({
//   name: z.string()
//     .min(1, "Name is required")
//     .max(100, "Name must be 100 characters or less")
//     .trim(),
//   phone: z.string()
//     .min(10, "Phone number must be at least 10 characters")
//     .max(15, "Phone number must be 15 characters or less")
//     .regex(/^[+\d\s()-]+$/, "Phone number can only contain numbers, spaces and symbols +()-")
//     .trim(),
//   address: z.string()
//     .max(200, "Address must be 200 characters or less")
//     .optional()
//     .nullable()
//     .transform(val => val === "" ? null : val?.trim()),
//   department: z.string()
//     .min(1, "Department is required")
//     .max(100, "Department must be 100 characters or less")
//     .trim(),
//   semester: z.preprocess(
//     (v) => v === "" ? null : Number(v), 
//     z.number().int().min(1, "Semester must be at least 1").max(8, "Semester cannot be more than 8").nullable().optional()
//   ),
//   college: z.string()
//     .min(1, "College name is required")
//     .max(100, "College name must be 100 characters or less")
//     .trim(),
//   usn: z.string()
//     .min(1, "USN is required")
//     .max(20, "USN must be 20 characters or less")
//     .regex(/^[a-zA-Z0-9-]+$/, "USN can only contain letters, numbers and hyphens")
//     .trim()
// })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      logger.warn("Unauthenticated profile access attempt")
      throw new Error("Not authenticated")
    }

    const userData = await db.query.user.findFirst({
      where: eq(user.email, session.user.email),
      with: {
        registrations: {
          with: {
            event: true,
          },
          orderBy: (registration, { desc }) => [desc(registration.createdAt)]
        }
      }
    });

    if (!userData) {
      logger.error("User not found in database despite valid session", { email: session.user.email })
      throw new Error("User not found")
    }

    const registrations: RegistrationSummary[] = userData.registrations.map((reg) => ({
      id: String(reg.id),
      eventId: reg.eventId,
      eventName: reg.event.title,
      date: new Date(reg.event.date).toISOString(),
      time: reg.event.time,
      location: reg.event.location,
      fee: Number(reg.event.fee),
      paymentStatus: reg.paymentStatus,
      createdAt: new Date(reg.createdAt).toISOString(),
    }))

    return JSON.parse(JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      role: userData.role,
      phone: userData.phone,
      address: userData.address,
      department: userData.department,
      semester: userData.semester,
      college: userData.college,
      usn: userData.usn,
      profileCompleted: userData.profileCompleted,
      registrations
    }))
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

    if (parsed.data.usn) {
      const existingUser = await db.query.user.findFirst({
        where: and(
          eq(user.usn, parsed.data.usn),
          not(eq(user.email, session.user.email))
        )
      });
      
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

    await db.update(user)
      .set({
        ...parsed.data,
        semester: parsed.data.semester ?? null,
        profileCompleted
      })
      .where(eq(user.email, session.user.email))
      .execute();

    logger.info("Profile updated successfully", { email: session.user.email })
    revalidatePath('/profile')
    return NextResponse.json({success: true}, { status: 200 })
  } catch (err) {
    logger.error("Failed to update profile", err instanceof Error ? err : new Error(String(err)))
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}