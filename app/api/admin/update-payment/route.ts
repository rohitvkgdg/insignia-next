import { NextResponse } from 'next/server'
import { updatePaymentStatus } from '@/app/actions/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, paymentStatus } = body  // Change from registrationId to id
    await updatePaymentStatus({ id, paymentStatus })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}