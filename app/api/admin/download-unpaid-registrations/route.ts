import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { registration, event } from "@/schema"
import { PaymentStatus } from "@/types/enums"
import * as XLSX from 'xlsx'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all unpaid registrations with user details, team members, and event info
    const registrations = await db.query.registration.findMany({
      where: eq(registration.paymentStatus, PaymentStatus.UNPAID),
      with: {
        user: {
          columns: {
            name: true,
            college: true,
            phone: true,
            usn: true
          }
        },
        teamMembers: {
          columns: {
            name: true,
            phone: true,
            usn: true
          }
        },
        event: {
          columns: {
            title: true,
            isTeamEvent: true,
            fee: true
          }
        }
      }
    })

    // Group registrations by event
    const eventGroups = registrations.reduce((groups, reg) => {
      const eventId = reg.eventId
      if (!groups[eventId]) {
        groups[eventId] = []
      }
      groups[eventId].push(reg)
      return groups
    }, {} as Record<string, typeof registrations>)

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Create a worksheet for each event
    Object.entries(eventGroups).forEach(([eventId, eventRegistrations]) => {
      if (eventRegistrations.length === 0) return

      const event = eventRegistrations[0].event
      let worksheetData: any[]

      if (event.isTeamEvent) {
        // Format data for team events
        worksheetData = eventRegistrations.map((reg) => {
          const teamLeader = reg.user
          const otherMembers = reg.teamMembers || []

          const baseRow: Record<string, string | number | undefined> = {
            'Registration ID': reg.registrationId,
            'Event': event.title,
            'Fee': event.fee,
            'Team Leader Name': teamLeader.name ?? undefined,
            'Team Leader USN': teamLeader.usn ?? undefined,
            'Team Leader College': teamLeader.college ?? undefined,
            'Team Leader Phone': teamLeader.phone ?? undefined,
          }

          // Add member columns dynamically
          otherMembers.forEach((member, idx) => {
            baseRow[`Member ${idx + 1} Name`] = member.name
            baseRow[`Member ${idx + 1} USN`] = member.usn
            baseRow[`Member ${idx + 1} Phone`] = member.phone
          })

          return baseRow
        })
      } else {
        // Format data for individual events
        worksheetData = eventRegistrations.map(reg => ({
          'Registration ID': reg.registrationId,
          'Event': event.title,
          'Fee': event.fee,
          'Name': reg.user.name ?? undefined,
          'USN': reg.user.usn ?? undefined,
          'College': reg.user.college ?? undefined,
          'Phone Number': reg.user.phone ?? undefined
        }))
      }

      // Convert to worksheet with styling
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Registration ID
        { wch: 25 }, // Event
        { wch: 10 }, // Fee
        { wch: 25 }, // Name
        { wch: 15 }, // USN
        { wch: 30 }, // College
        { wch: 15 }, // Phone
      ]
      worksheet['!cols'] = colWidths

      // Add worksheet to workbook with event title as sheet name
      const sheetName = event.title.slice(0, 31) // Excel has a 31 character limit for sheet names
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create response with proper headers
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="unpaid_registrations.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Download unpaid registrations error:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}