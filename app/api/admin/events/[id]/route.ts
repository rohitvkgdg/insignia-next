import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { deleteEvent } from "@/app/actions/events"
import { ApiError } from "@/lib/server-utils"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await deleteEvent(params.id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return new NextResponse(error.message, { status: error.statusCode })
    }
    console.error("Delete event error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}