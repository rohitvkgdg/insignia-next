"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Role, PaymentStatus, RegistrationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { NextResponse } from "next/server"

export interface RegistrationSummary {
  id: string
  eventId: string
  eventName: string
  date: Date
  time: string
  location: string
  fee: number
  status: RegistrationStatus
  paymentStatus: PaymentStatus
  createdAt: Date
}

export interface UserProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: Role
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

function isProfileComplete(profile: {
  department: string | null,
  college: string | null,
  phone: string | null,
  usn: string | null
}): boolean {
  return Boolean(
    profile.department?.trim() &&
    profile.college?.trim() &&
    profile.phone?.trim() &&
    profile.usn?.trim()
  )
}

export async function getUserProfile() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registrations: { include: { event: true, payment: true }, orderBy: { createdAt: "desc" } }
      }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const registrations: RegistrationSummary[] = user.registrations.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      eventName: reg.event.title,
      date: reg.event.date.toISOString(),
      time: reg.event.time,
      location: reg.event.location,
      fee: reg.event.fee,
      status: reg.status,
      paymentStatus: reg.payment?.status ?? PaymentStatus.UNPAID,
      createdAt: reg.createdAt.toISOString()
    }))

    const payload: UserProfileData = {
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
    }
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    console.error("[getUserProfile] ", err)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<void | NextResponse> {
  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { department, college, phone, usn } = parsed.data
    const profileCompleted = Boolean(
      department.trim() && college.trim() && phone.trim() && usn.trim()
    )

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...parsed.data,
        semester: parsed.data.semester ?? null,
        profileCompleted
      }
    })
  revalidatePath('/profile')
  return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (err) {
    console.error("[updateProfile] ", err)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}