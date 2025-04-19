import { z } from "zod"
import { Event, RegistrationStatus, PaymentStatus, Role } from "@prisma/client"

// Common validation schemas that can be reused throughout the application

// User validation schemas
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .min(5, "Email must be at least 5 characters")
  .max(255, "Email must be 255 characters or less")

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be 100 characters or less")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: emailSchema,
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be 15 characters or less")
    .regex(/^[+\d\s()-]+$/, "Phone number contains invalid characters")
    .optional()
    .nullable(),
})

// Event search validation schema
export const eventSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  category: z.nativeEnum(Event).optional(),
  searchQuery: z.string().max(100).optional(),
  upcoming: z.coerce.boolean().optional(),
})

// Event filter validation schema
export const eventFilterSchema = z.object({
  category: z.nativeEnum(EventCategory).optional(),
  minFee: z.coerce.number().min(0).optional(),
  maxFee: z.coerce.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// Admin action validation schemas
export const changeRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  role: z.nativeEnum(Role, { 
    errorMap: () => ({ message: "Invalid role" }) 
  })
})

export const updateRegistrationStatusSchema = z.object({
  registrationId: z.string().uuid("Invalid registration ID format"),
  status: z.nativeEnum(RegistrationStatus, { 
    errorMap: () => ({ message: "Invalid registration status" }) 
  }),
  notes: z.string().max(500).optional(),
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID format"),
  status: z.nativeEnum(PaymentStatus, { 
    errorMap: () => ({ message: "Invalid payment status" }) 
  }),
  transactionId: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

// Helper function to validate and sanitize pagination parameters
export function validatePagination(page?: unknown, limit?: unknown) {
  const schema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  
  return schema.parse({ page, limit })
}

// Helper function to safely parse UUIDs
export function validateUuid(id: unknown) {
  return z.string().uuid("Invalid ID format").parse(id)
}

// Helper function to safely parse enum values
export function validateEnum<T extends [string, ...string[]]>(
  value: unknown, 
  enumValues: T
) {
  return z.enum(enumValues).safeParse(value)
}

// Helper function to validate date strings
export function validateDate(dateString: unknown, errorMessage = "Invalid date format") {
  return z.string().datetime({ message: errorMessage }).safeParse(dateString)
}