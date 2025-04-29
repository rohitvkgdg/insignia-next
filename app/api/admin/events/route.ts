import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAdminEvents } from "@/app/actions/admin"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const result = await getAdminEvents(page, limit, search, sortBy, sortOrder)
    
    if (!result) {
      return NextResponse.json({ error: "No events found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error in events API route:", { error })
    const message = error instanceof Error ? error.message : "Failed to fetch events"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}