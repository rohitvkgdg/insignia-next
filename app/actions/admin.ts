import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { registration, event } from "@/schema"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { PaymentStatus } from "@/types/enums"
import { sql, desc } from "drizzle-orm/sql"

export type RegistrationData = {
  id: string
  userName: string | null
  eventName: string
  date: string
  status: string
  paymentStatus: PaymentStatus
}

export type AdminEventData = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  registrationCount: number
}

// Validation schemas
const updatePaymentSchema = z.object({
  id: z.string().uuid("Invalid registration ID"), // Change from registrationId to id
  paymentStatus: z.nativeEnum(PaymentStatus),
});

const deleteRegistrationSchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID"),
});

export async function updatePaymentStatus(data: {
  id: string;  // Change from registrationId to id
  paymentStatus: PaymentStatus;
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    const validated = updatePaymentSchema.parse(data)

    const [updated] = await db
      .update(registration)
      .set({ 
        paymentStatus: validated.paymentStatus,
        updatedAt: new Date()
      })
      .where(eq(registration.id, validated.id))
      .returning()

    if (!updated) {
      throw new Error("Registration not found")
    }

    logger.info("Payment status updated", {
      registrationId: validated.id,
      status: validated.paymentStatus,
      updatedBy: session.user.email
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    logger.error("Failed to update payment status", { error })
    throw error
  }
}

export async function deleteRegistration(registrationId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    const validated = deleteRegistrationSchema.parse({ registrationId })

    const [deleted] = await db.delete(registration)
      .where(eq(registration.id, validated.registrationId))
      .returning()

    if (!deleted) {
      throw new Error("Registration not found")
    }

    logger.info("Registration deleted", {
      registrationId: validated.registrationId,
      deletedBy: session.user.email
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    logger.error("Failed to delete registration", { error })
    throw error
  }
}

export async function getRecentRegistrations(
  page = 1,
  limit = 10,
  searchQuery?: string
): Promise<{ data: RegistrationData[], metadata: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    let whereClause = undefined;
    if (searchQuery) {
      whereClause = sql`CAST(registration.id AS TEXT) ILIKE ${`%${searchQuery}%`} OR 
                       user.name ILIKE ${`%${searchQuery}%`}`;
    }

    const registrations = await db.query.registration.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            name: true,
          }
        },
        event: {
          columns: {
            title: true,
            date: true,
          }
        }
      },
      limit,
      offset: (page - 1) * limit,
      orderBy: (reg, { desc }) => [desc(reg.createdAt)]
    });

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(registration)
      .where(whereClause || sql`TRUE`);

    const total = totalResult[0].count;

    const data = registrations.map(reg => ({
      id: reg.id,
      userName: reg.user.name,
      eventName: reg.event.title,
      date: reg.event.date.toISOString(),
      status: reg.paymentStatus === PaymentStatus.PAID ? "CONFIRMED" : "PENDING",
      paymentStatus: reg.paymentStatus as PaymentStatus,
    }));

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    logger.error("Failed to fetch recent registrations", { error })
    throw error
  }
}

export async function getAdminEvents(): Promise<AdminEventData[]> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    const events = await db.query.event.findMany({
      with: {
        registrations: {
          columns: {
            id: true,
          }
        }
      },
      orderBy: (events, { desc }) => [desc(events.date)]
    })

    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: event.date.toISOString(),
      time: event.time,
      location: event.location,
      category: event.category,
      registrationCount: event.registrations.length,
    }))
  } catch (error) {
    logger.error("Failed to fetch admin events", { error })
    throw error
  }
}

export async function getEventAnalytics() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    // Get registrations by category
    const registrationsByCategory = await db
      .select({
        category: event.category,
        total: sql`count(${registration.id})`.as('total'),
        paid: sql`count(case when ${registration.paymentStatus} = 'PAID' then 1 end)`.as('paid'),
        unpaid: sql`count(case when ${registration.paymentStatus} = 'UNPAID' then 1 end)`.as('unpaid'),
        revenue: sql`sum(case when ${registration.paymentStatus} = 'PAID' then ${event.fee} else 0 end)`.as('revenue')
      })
      .from(event)
      .leftJoin(registration, eq(event.id, registration.eventId))
      .groupBy(event.category);

    // Get recent registration trends
    const registrationTrends = await db
      .select({
        date: sql`date(${registration.createdAt})`.as('date'),
        count: sql`count(*)`.as('count')
      })
      .from(registration)
      .groupBy(sql`date(${registration.createdAt})`)
      .orderBy(desc(sql`date(${registration.createdAt})`))
      .limit(7);

    // Get top events by registration
    const topEvents = await db
      .select({
        eventId: event.id,
        title: event.title,
        category: event.category,
        registrations: sql`count(${registration.id})`.as('registrations'),
        revenue: sql`sum(case when ${registration.paymentStatus} = 'PAID' then ${event.fee} else 0 end)`.as('revenue')
      })
      .from(event)
      .leftJoin(registration, eq(event.id, registration.eventId))
      .groupBy(event.id)
      .orderBy(desc(sql`count(${registration.id})`))
      .limit(5);

    return {
      byCategory: registrationsByCategory,
      trends: registrationTrends,
      topEvents
    }
  } catch (error) {
    logger.error("Failed to fetch event analytics", { error })
    throw error
  }
}