"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { Role, PaymentStatus, RegistrationStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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

export async function getUserProfile(): Promise<UserProfileData> {
  const session = await getServerSession()
  if (!session?.user?.email) throw new Error("Not authenticated")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      registrations: {
        include: {
          event: true,
          payment: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })
  if (!user) throw new Error("User not found")

  const registrationsWithPayments: RegistrationSummary[] = user.registrations.map((reg) => ({
    id: reg.id,
    eventId: reg.eventId,
    eventName: reg.event.title,
    date: reg.event.date,
    time: reg.event.time,
    location: reg.event.location,
    fee: reg.event.fee,
    status: reg.status,
    paymentStatus: reg.payment?.status ?? PaymentStatus.UNPAID,
    createdAt: reg.createdAt
  }))

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    role: user.role,
    phone: user.phone ?? null,
    address: user.address ?? null,
    department: user.department ?? null,
    semester: user.semester ?? null,
    college: user.college ?? null,
    usn: user.usn ?? null,
    profileCompleted: user.profileCompleted,
    registrations: registrationsWithPayments
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<void> {
  const validatedData = updateProfileSchema.parse(data)
  const session = await getServerSession()
  if (!session?.user?.email) throw new Error("Not authenticated")

  const profileCompleted = isProfileComplete({
    department: validatedData.department,
    college: validatedData.college,
    phone: validatedData.phone,
    usn: validatedData.usn
  })

  const updateData = {
    name: validatedData.name,
    phone: validatedData.phone,
    address: validatedData.address,
    department: validatedData.department,
    semester: validatedData.semester ?? null,
    college: validatedData.college,
    usn: validatedData.usn,
    profileCompleted
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: updateData
  })
  revalidatePath('/profile')
}