import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { updatePaymentStatus } from "@/app/actions/admin"
import { logger } from "@/lib/logger"
import { PaymentStatus } from "@/types/enums"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.id || !body.paymentStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Validate payment status enum value
    if (!Object.values(PaymentStatus).includes(body.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
    }

    const result = await updatePaymentStatus({
      id: body.id,
      paymentStatus: body.paymentStatus
    })
    
    return NextResponse.json(result)
  } catch (error) {
    logger.error("Error updating payment status", { error })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to update payment status" 
    }, { status: 500 })
  }
}