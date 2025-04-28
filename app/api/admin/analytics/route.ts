import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getEventAnalytics } from "@/app/actions/admin"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analytics = await getEventAnalytics()
    
    return NextResponse.json(analytics)
  } catch (error) {
    logger.error("Error fetching analytics", { error })
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}