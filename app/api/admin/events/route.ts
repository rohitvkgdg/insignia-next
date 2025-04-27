import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAdminEvents } from "@/app/actions/admin"

export async function GET(request: NextRequest) {
  try {
    const events = await getAdminEvents()
    return Response.json(events)
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}