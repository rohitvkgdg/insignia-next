import { getServerSession } from "next-auth"
import { z } from "zod"
import { db } from "@/lib/db"
import { eq, ilike, or } from "drizzle-orm"
import { registration, event, eventCategoryEnum } from "@/schema"
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

    // Get event ID before deleting
    const registrationData = await db.query.registration.findFirst({
      where: eq(registration.id, validated.registrationId),
      columns: {
        eventId: true
      }
    });

    if (!registrationData) {
      throw new Error("Registration not found")
    }

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
    revalidatePath(`/events/${registrationData.eventId}`) // Revalidate the event page
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
      whereClause = or(
        ilike(registration.registrationId, `%${searchQuery}%`),
        sql`EXISTS (
          SELECT 1 FROM "user" 
          WHERE "user"."id" = ${registration.userId} 
          AND ("user"."name" ILIKE ${`%${searchQuery}%`} OR "user"."usn" ILIKE ${`%${searchQuery}%`})
        )`,
        sql`EXISTS (
          SELECT 1 FROM "event" 
          WHERE "event"."id" = ${registration.eventId} 
          AND "event"."title" ILIKE ${`%${searchQuery}%`}
        )`
      );
    }

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
      orderBy: (fields) => {
        switch(sortBy) {
          case 'userName':
            return sql`(
              SELECT "user"."name" 
              FROM "user" 
              WHERE "user"."id" = ${fields.userId}
            ) ${sortOrder === 'desc' ? sql`DESC NULLS LAST` : sql`ASC NULLS FIRST`}`;
          case 'eventName':
            return sql`(
              SELECT "event"."title" 
              FROM "event" 
              WHERE "event"."id" = ${fields.eventId}
            ) ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
          case 'date':
            return sql`(
              SELECT "event"."date" 
              FROM "event" 
              WHERE "event"."id" = ${fields.eventId}
            ) ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
          case 'status':
            return sql`${fields.paymentStatus} ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
          case 'createdAt':
          default:
            return sql`${fields.createdAt} ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
        }
      }
    });

    // Get total count with the same search conditions
    const totalResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(registration)
      .where(whereClause || sql`TRUE`);

    const total = totalResult[0].count;

    // Map the results with proper type handling
    const data = registrations.map(reg => ({
      id: reg.id,
      registrationId: reg.registrationId,
      userName: reg.user?.name || null,
      userEmail: reg.user?.email || null,
      userPhone: reg.user?.phone || null,
      userUSN: reg.user?.usn || null,
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
      // Check if the search query matches any event category (case insensitive)
      const normalizedSearch = searchQuery.toUpperCase();
      const matchesCategory = eventCategoryEnum.enumValues.some((cat: string) => 
        cat.includes(normalizedSearch)
      );

      whereClause = or(
        ilike(event.title, `%${searchQuery}%`),
        ilike(event.description, `%${searchQuery}%`),
        ilike(event.location, `%${searchQuery}%`),
        matchesCategory ? sql`${event.category}::text = ${searchQuery.toUpperCase()}` : sql`false`
      );
    }

    // Determine ordering
    const getOrderBy = (evt: any, { desc, asc }: any) => {
      switch(sortBy) {
        case 'title':
          return sortOrder === 'desc' ? [desc(evt.title)] : [asc(evt.title)];
        case 'category':
          return sortOrder === 'desc' ? [desc(evt.category)] : [asc(evt.category)];
        case 'registrations':
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
          with: {
            teamMembers: true
          },
          columns: {
            id: true,
            paymentStatus: true,
            registrationId: true
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
      
      // Calculate revenue considering team sizes for team events
      const revenue = event.registrations.reduce((total, reg) => {
        if (reg.paymentStatus === PaymentStatus.PAID) {
          const teamSize = event.isTeamEvent ? reg.teamMembers.length : 1;
          return total + (Number(event.fee) * teamSize);
        }
        return total;
      }, 0);
      
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

    // Get registrations by category with correct counting
    const registrationsByCategory = await db
      .select({
        category: event.category,
        total: sql<number>`CAST(COUNT(DISTINCT ${registration.id}) AS INTEGER)`.as('total'),
        paid: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${registration.paymentStatus} = 'PAID' THEN ${registration.id} END) AS INTEGER)`.as('paid'),
        unpaid: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${registration.paymentStatus} = 'UNPAID' THEN ${registration.id} END) AS INTEGER)`.as('unpaid'),
        revenue: sql<number>`CAST(COALESCE(SUM(
          CASE WHEN ${registration.paymentStatus} = 'PAID' THEN 
            CASE WHEN ${event.isTeamEvent} = true THEN 
              ${event.fee} * (SELECT COUNT(*) FROM "teamMember" WHERE "teamMember"."registrationId" = ${registration.registrationId})
            ELSE ${event.fee} 
            END
          ELSE 0 
          END
        ), 0) AS INTEGER)`.as('revenue')
      })
      .from(event)
      .leftJoin(registration, eq(event.id, registration.eventId))
      .groupBy(event.category);

    // Get recent registration trends with correct daily aggregation
    const registrationTrends = await db
      .select({
        date: sql<string>`to_char(date(${registration.createdAt}), 'YYYY-MM-DD')`.as('date'),
        count: sql<number>`CAST(COUNT(DISTINCT ${registration.id}) AS INTEGER)`.as('count')
      })
      .from(registration)
      .groupBy(sql`date(${registration.createdAt})`)
      .orderBy(desc(sql`date(${registration.createdAt})`))
      .limit(7);

    // Get top events with correct revenue calculation
    const topEvents = await db
      .select({
        eventId: event.id,
        title: event.title,
        category: event.category,
        registrations: sql<number>`CAST(COUNT(DISTINCT ${registration.id}) AS INTEGER)`.as('registrations'),
        revenue: sql<number>`CAST(COALESCE(SUM(
          CASE WHEN ${registration.paymentStatus} = 'PAID' THEN 
            CASE WHEN ${event.isTeamEvent} = true THEN 
              ${event.fee} * (SELECT COUNT(*) FROM "teamMember" WHERE "teamMember"."registrationId" = ${registration.registrationId})
            ELSE ${event.fee} 
            END
          ELSE 0 
          END
        ), 0) AS INTEGER)`.as('revenue')
      })
      .from(event)
      .leftJoin(registration, eq(event.id, registration.eventId))
      .groupBy(event.id, event.title, event.category)
      .orderBy(desc(sql`COUNT(DISTINCT ${registration.id})`))
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