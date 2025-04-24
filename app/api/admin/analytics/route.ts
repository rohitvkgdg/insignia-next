import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { event, registration } from "@/schema"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { desc } from "drizzle-orm/sql"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get registrations by category
  const registrationsByCategory = await db
    .select({
      category: event.category,
      total: sql<number>`count(${registration.id})`.as('total'),
      paid: sql<number>`count(case when ${registration.paymentStatus} = 'PAID' then 1 end)`.as('paid'),
      unpaid: sql<number>`count(case when ${registration.paymentStatus} = 'UNPAID' then 1 end)`.as('unpaid'),
      revenue: sql<number>`sum(case when ${registration.paymentStatus} = 'PAID' then ${event.fee} else 0 end)`.as('revenue')
    })
    .from(event)
    .leftJoin(registration, eq(event.id, registration.eventId))
    .groupBy(event.category)

  // Get registration trends (last 30 days)
  const registrationTrends = await db
    .select({
      date: sql<string>`date(${registration.createdAt})`.as('date'),
      count: sql<number>`count(*)`.as('count')
    })
    .from(registration)
    .where(sql`${registration.createdAt} >= NOW() - INTERVAL '30 days'`)
    .groupBy(sql`date(${registration.createdAt})`)
    .orderBy(desc(sql`date(${registration.createdAt})`))

  // Get top performing events
  const topEvents = await db
    .select({
      eventId: event.id,
      title: event.title,
      category: event.category,
      registrations: sql<number>`count(${registration.id})`.as('registrations'),
      revenue: sql<number>`sum(case when ${registration.paymentStatus} = 'PAID' then ${event.fee} else 0 end)`.as('revenue')
    })
    .from(event)
    .leftJoin(registration, eq(event.id, registration.eventId))
    .groupBy(event.id, event.title, event.category)
    .orderBy(desc(sql`count(${registration.id})`))
    .limit(5)

  return NextResponse.json({
    byCategory: registrationsByCategory,
    trends: registrationTrends,
    topEvents
  })
}