import { db } from "@/lib/db"
import { event, registration } from "@/schema"
import { eq, count } from "drizzle-orm"

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        code: error.code ?? "ERROR",
        message: error.message
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  console.error(error)
  return new Response(
    JSON.stringify({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred"
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  )
}

export async function generateRegistrationId(eventId: string): Promise<string> {
  // Get the event
  const eventData = await db.query.event.findFirst({
    where: eq(event.id, eventId),
    columns: {
      title: true
    }
  });
  
  if (!eventData) {
    throw new Error("Event not found");
  }
  
  // Create event code (first 4 chars of event title)
  // Uppercase and handle short names with padding
  let eventCode = eventData.title.slice(0, 4).toUpperCase();
  eventCode = eventCode.padEnd(4, 'X');
  
  // Count existing registrations for this event
  const countResult = await db.select({ value: count() })
    .from(registration)
    .where(eq(registration.eventId, eventId));
  
  // Pad sequential number with zeros (3 digits)
  const sequentialId = (countResult[0].value + 1).toString().padStart(3, '0');
  
  // Combine to create registration ID: INS-HACK-042
  return `INS-${eventCode}-${sequentialId}`;
}