"use server"

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logger } from "@/lib/logger"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { eq, and, not } from 'drizzle-orm'
import { user } from '@/schema'
import { updateProfileSchema } from "@/lib/validation"

export interface RegistrationSummary {
  id: string
  registrationId: string
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
  role: string
  phone: string | null
  college: string | null
  usn: string | null
  profileCompleted: boolean
  accommodation: boolean
  registrations: RegistrationSummary[]
}

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
      registrationId: String(reg.registrationId),
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
      role: userData.role,
      phone: userData.phone,
      college: userData.college,
      usn: userData.usn,
      profileCompleted: userData.profileCompleted,
      accommodation: userData.accommodation,
      registrations
    }))
  } catch (err) {
    logger.error("Failed to fetch profile", err instanceof Error ? err : new Error(String(err)))
    throw new Error(err instanceof Error ? err.message : "Failed to fetch profile")
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = updateProfileSchema.safeParse(data)
    if (!parsed.success) {
      logger.info("Invalid profile update data", { errors: parsed.error.flatten().fieldErrors })
      return { 
        success: false, 
        error: "Invalid profile update data"
      }
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      logger.warn("Unauthenticated profile update attempt")
      return { 
        success: false, 
        error: "Not authenticated" 
      }
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
        return { 
          success: false, 
          error: "This USN is already registered with another account" 
        }
      }
    }

    // Get current user data to check all required fields
    const currentUser = await db.query.user.findFirst({
      where: eq(user.email, session.user.email),
      columns: {
        name: true,
        usn: true,
        phone: true
      }
    });

    // Combine current and new data to check if all required fields are present
    const updatedFields = {
      name: parsed.data.name || currentUser?.name,
      usn: parsed.data.usn || currentUser?.usn,
      phone: parsed.data.phone || currentUser?.phone
    };

    const isProfileComplete = Boolean(
      updatedFields.name && 
      updatedFields.usn && 
      updatedFields.phone
    );

    // Update user data
    await db.update(user)
      .set({
        ...parsed.data,
        profileCompleted: isProfileComplete,
      })
      .where(eq(user.email, session.user.email))

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    logger.error("Profile update failed", { error: error instanceof Error ? error.message : String(error) })
    return { 
      success: false, 
      error: "Failed to update profile" 
    }
  }
}