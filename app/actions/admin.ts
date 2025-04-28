import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { registration, event, user } from "@/schema"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { PaymentStatus } from "@/types/enums"
import { sql, desc } from "drizzle-orm/sql"

export type RegistrationData = {
  id: string
  registrationId: string
  userName: string | null
  userEmail: string | null
  userPhone: string | null
  userUSN: string | null
  eventName: string
  eventFee: string | number
  date: string
  time: string
  location: string
  createdAt: string
  status: string
  paymentStatus: PaymentStatus
  teamSize: number
}

export type AdminEventData = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  fee: number
  registrationCount: number
  paidRegistrations: number
  revenue: number
  createdAt: string
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

export async function getRegistrations(
  page = 1,
  limit = 10,
  searchQuery?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ data: RegistrationData[], metadata: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    let whereClause = undefined;
    if (searchQuery) {
      whereClause = sql`CAST(registration.id AS TEXT) ILIKE ${`%${searchQuery}%`} OR 
                       user.name ILIKE ${`%${searchQuery}%`} OR
                       event.title ILIKE ${`%${searchQuery}%`}`;
    }

    // Determine ordering
    const getOrderBy = (reg: any, { desc, asc }: any) => {
      switch(sortBy) {
        case 'userName':
          return sortOrder === 'desc' ? [desc(sql`user.name`)] : [asc(sql`user.name`)];
        case 'eventName':
          return sortOrder === 'desc' ? [desc(sql`event.title`)] : [asc(sql`event.title`)];
        case 'date':
          return sortOrder === 'desc' ? [desc(sql`event.date`)] : [asc(sql`event.date`)];
        case 'status':
          return sortOrder === 'desc' ? [desc(registration.paymentStatus)] : [asc(registration.paymentStatus)];
        case 'createdAt':
        default:
          return sortOrder === 'desc' ? [desc(reg.createdAt)] : [asc(reg.createdAt)];
      }
    };

    const registrations = await db.query.registration.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            phone: true,
            usn: true
          }
        },
        event: {
          columns: {
            title: true,
            date: true,
            fee: true,
            location: true,
            time: true
          }
        },
        teamMembers: true
      },
      limit,
      offset: (page - 1) * limit,
      orderBy: getOrderBy
    });

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(registration)
      .leftJoin(event, eq(registration.eventId, event.id))
      .leftJoin(user, eq(registration.userId, user.id))
      .where(whereClause || sql`TRUE`);

    const total = totalResult[0].count;

    const data = registrations.map(reg => ({
      id: reg.id,
      registrationId: reg.registrationId,
      userName: reg.user.name,
      userEmail: reg.user.email,
      userPhone: reg.user.phone,
      userUSN: reg.user.usn,
      eventName: reg.event.title,
      eventFee: reg.event.fee,
      date: reg.event.date.toISOString(),
      time: reg.event.time,
      location: reg.event.location,
      createdAt: reg.createdAt.toISOString(),
      status: reg.paymentStatus === PaymentStatus.PAID ? "CONFIRMED" : "PENDING",
      paymentStatus: reg.paymentStatus as PaymentStatus,
      teamSize: reg.teamMembers?.length || 0
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
    logger.error("Failed to fetch registrations", { error })
    throw error
  }
}

export async function getAdminEvents(
  page = 1,
  limit = 10,
  searchQuery?: string,
  sortBy: string = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ data: AdminEventData[], metadata: { total: number; page: number; limit: number; totalPages: number } }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized")
    }

    let whereClause = undefined;
    if (searchQuery) {
      whereClause = sql`event.title ILIKE ${`%${searchQuery}%`} OR 
                      event.description ILIKE ${`%${searchQuery}%`} OR
                      event.category ILIKE ${`%${searchQuery}%`} OR
                      event.location ILIKE ${`%${searchQuery}%`}`;
    }

    // Determine ordering
    const getOrderBy = (evt: any, { desc, asc }: any) => {
      switch(sortBy) {
        case 'title':
          return sortOrder === 'desc' ? [desc(evt.title)] : [asc(evt.title)];
        case 'category':
          return sortOrder === 'desc' ? [desc(evt.category)] : [asc(evt.category)];
        case 'registrations':
          // This is a bit complex as we need to count relationships
          return sortOrder === 'desc' 
            ? [desc(sql`(SELECT COUNT(*) FROM "registration" WHERE "registration"."eventId" = "event"."id")`)]
            : [asc(sql`(SELECT COUNT(*) FROM "registration" WHERE "registration"."eventId" = "event"."id")`)];
        case 'date':
        default:
          return sortOrder === 'desc' ? [desc(evt.date)] : [asc(evt.date)];
      }
    };

    // Fetch events with pagination
    const events = await db.query.event.findMany({
      where: whereClause,
      with: {
        registrations: {
          columns: {
            id: true,
            paymentStatus: true,
          }
        }
      },
      limit,
      offset: (page - 1) * limit,
      orderBy: getOrderBy
    });

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(event)
      .where(whereClause || sql`TRUE`);
    
    const total = totalResult[0].count;

    // Prepare data for frontend
    const data = events.map(event => {
      // Calculate paid registrations for revenue
      const paidRegistrations = event.registrations.filter(reg => 
        reg.paymentStatus === PaymentStatus.PAID
      ).length;
      
      const revenue = paidRegistrations * Number(event.fee);
      
      return {
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date.toISOString(),
        time: event.time,
        location: event.location,
        category: event.category,
        fee: Number(event.fee),
        registrationCount: event.registrations.length,
        paidRegistrations,
        revenue,
        createdAt: event.createdAt.toISOString()
      };
    });

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