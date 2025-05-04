import { db } from "@/lib/db"
import { event, user } from "@/schema"
import { eq } from "drizzle-orm"

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

// Add department code enum at the top with all departments
export enum DepartmentCode {
  COMPUTER_SCIENCE = "CSE",
  INFORMATION_SCIENCE = "ISE",
  AI_ML = "AIML",
  ELECTRONICS = "ECE",
  ELECTRICAL = "EEE",
  MECHANICAL = "MECH",
  CIVIL = "CIVIL",
  PHYSICS = "PHY",
  CHEMISTRY = "CHEM",
  CHEMICAL = "CHTY",
  HUMANITIES = "HUM",
  MATHEMATICS = "MATH",
  CENTRALIZED = "CEN",
  CULTURAL = "CUL",
  LITERARY = "LIT",
  FINEARTS = "FNA",
  MBA = "MBA"
}

export async function generateUserId(): Promise<string> {
  // Get the current highest user ID
  const highestUser = await db.query.user.findFirst({
    orderBy: (user, { desc }) => [desc(user.numericId)],
  });

  // If no users exist, start from 10001 (5 digits)
  // If users exist, increment the highest ID
  const nextNumericId = highestUser ? highestUser.numericId + 1 : 10001;
  
  // Ensure the ID stays within 5 digits (10001-99999)
  if (nextNumericId > 99999) {
    throw new Error("User ID limit reached");
  }

  return nextNumericId.toString();
}

export async function generateRegistrationId(eventId: string, userId: string): Promise<string> {
  // Get the event details and user details
  const [eventData, userData] = await Promise.all([
    db.query.event.findFirst({
      where: eq(event.id, eventId),
      columns: {
        id: true,
        department: true,
        category: true
      }
    }),
    db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        numericId: true
      }
    })
  ]);
  
  if (!eventData) {
    throw new Error("Event not found");
  }
  
  if (!userData) {
    throw new Error("User not found");
  }
  
  // Determine department code based on event category/department
  let deptCode: string;
  if (eventData.category === "TECHNICAL" && eventData.department) {
    // Map department to corresponding code for technical events
    switch (eventData.department) {
      case "CSE":
        deptCode = DepartmentCode.COMPUTER_SCIENCE;
        break;
      case "ISE":
        deptCode = DepartmentCode.INFORMATION_SCIENCE;
        break;
      case "AIML":
        deptCode = DepartmentCode.AI_ML;
        break;
      case "ECE":
        deptCode = DepartmentCode.ELECTRONICS;
        break;
      case "EEE":
        deptCode = DepartmentCode.ELECTRICAL;
        break;
      case "MECH":
        deptCode = DepartmentCode.MECHANICAL;
        break;
      case "CIVIL":
        deptCode = DepartmentCode.CIVIL;
        break;
      case "PHY":
        deptCode = DepartmentCode.PHYSICS;
        break;
      case "CHEM":
        deptCode = DepartmentCode.CHEMISTRY;
        break;
      case "CHTY":
        deptCode = DepartmentCode.CHEMICAL;
        break;
      case "HUM":
        deptCode = DepartmentCode.HUMANITIES;
        break;
      case "MATH":
        deptCode = DepartmentCode.MATHEMATICS;
        break;
      case "MBA":
        deptCode = DepartmentCode.MBA;
        break;
      default:
        deptCode = DepartmentCode.CENTRALIZED;
    }
  } else {
    // For non-technical events, determine based on category
    switch (eventData.category) {
      case "CULTURAL":
        deptCode = DepartmentCode.CULTURAL;
        break;
      case "LITERARY":
        deptCode = DepartmentCode.LITERARY;
        break;
      case "FINEARTS":
        deptCode = DepartmentCode.FINEARTS;
        break;
      default:
        deptCode = DepartmentCode.CENTRALIZED;
    }
  }
  
  // Format event ID to 2 digits and user ID to 5 digits
  const formattedEventId = eventData.id.slice(-2).padStart(2, '0');
  const formattedUserId = userData.numericId.toString().padStart(5, '0');
  
  // Format: INS-{deptCode}-{eventId}-{userId}
  return `INS-${deptCode}-${formattedEventId}-${formattedUserId}`;
}