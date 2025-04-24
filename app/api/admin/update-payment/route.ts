import { NextResponse } from 'next/server'
import { updatePaymentStatus } from '@/app/actions/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { registrationId, paymentStatus } = body
    await updatePaymentStatus({ registrationId, paymentStatus })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}