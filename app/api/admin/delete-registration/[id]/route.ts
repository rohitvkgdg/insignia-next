import { NextResponse } from 'next/server'
import { deleteRegistration } from '@/app/actions/admin'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteRegistration(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
  }
}