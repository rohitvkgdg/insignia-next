import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { registration, event, user, teamMember } from "@/schema"
import { eq, and } from "drizzle-orm"
import { PaymentStatus } from "@/types/enums"
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get eventId from query params
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return new NextResponse("Event ID is required", { status: 400 })
    }

    // First get event details to check if it's a team event
    const eventData = await db.query.event.findFirst({
      where: eq(event.id, eventId),
      columns: {
        title: true,
        isTeamEvent: true
      }
    })

    if (!eventData) {
      return new NextResponse("Event not found", { status: 404 })
    }

    // Get registrations with user details and team members
    const registrations = await db.query.registration.findMany({
      where: and(
        eq(registration.eventId, eventId),
        eq(registration.paymentStatus, PaymentStatus.PAID)
      ),
      with: {
        user: {
          columns: {
            name: true,
            college: true,
            phone: true
          }
        },
        teamMembers: {
          columns: {
            name: true,
            phone: true
          }
        },
        event: {
          columns: {
            title: true
          }
        }
      }
    })

    let worksheetData: any[];

    if (eventData.isTeamEvent) {
      // Format data for team events
      worksheetData = registrations.map((reg, index) => {
        const teamLeader = reg.user;
        const otherMembers = reg.teamMembers || [];

        const baseRow: Record<string, string | number | undefined> = {
          'Registration ID': reg.registrationId,
          'Team Leader Name': teamLeader.name ?? undefined,
          'Team Leader College': teamLeader.college ?? undefined,
          'Team Leader Phone': teamLeader.phone ?? undefined,
        }

        // Add member columns dynamically
        otherMembers.forEach((member, idx) => {
          baseRow[`Member ${idx + 1} Name`] = member.name
          baseRow[`Member ${idx + 1} Phone`] = member.phone
        })

        return baseRow
      })
    } else {
      // Format data for individual events
      worksheetData = registrations.map(reg => ({
        'Registration ID': reg.registrationId,
        'Name': reg.user.name ?? undefined,
        'College': reg.user.college ?? undefined,
        'Phone Number': reg.user.phone ?? undefined
      }))
    }

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new()
    
    // Convert to worksheet with styling
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Registration ID
      { wch: 25 }, // Name
      { wch: 30 }, // College
      { wch: 15 }, // Phone
    ]
    worksheet['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create response with proper headers
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${eventData.title}_registrations.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Download registrations error:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}