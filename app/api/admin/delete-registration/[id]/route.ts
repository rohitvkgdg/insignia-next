import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { deleteRegistration } from "@/app/actions/admin"
import { logger } from "@/lib/logger"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registrationId = params.id
    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    const result = await deleteRegistration(registrationId)
    
    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error deleting registration", { error })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to delete registration" 
    }, { status: 500 })
  }
}