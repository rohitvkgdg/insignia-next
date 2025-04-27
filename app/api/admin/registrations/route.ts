import { NextRequest } from "next/server"
import { getRecentRegistrations } from "@/app/actions/admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined

    const result = await getRecentRegistrations(page, limit, search)
    return Response.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}