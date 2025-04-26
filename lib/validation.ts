import { z } from "zod"
import { PaymentStatus, Role, EventCategory } from "@/types/enums"

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
  page: z.coerce.number()
    .int("Page must be a whole number")
    .positive("Page must be a positive number")
    .default(1),
  limit: z.coerce.number()
    .int("Limit must be a whole number")
    .positive("Limit must be a positive number")
    .max(100, "Maximum 100 results per page")
    .default(10),
  category: z.nativeEnum(EventCategory, {
    errorMap: () => ({ message: "Invalid event category" })
  }).optional(),
  searchQuery: z.string()
    .max(100, "Search query is too long")
    .trim()
    .optional()
    .transform(val => val === "" ? undefined : val),
  upcoming: z.coerce.boolean().optional(),
})

// Event filter validation schema
export const eventFilterSchema = z.object({
  category: z.nativeEnum(EventCategory, {
    errorMap: () => ({ message: "Invalid event category" })
  }).optional(),
  startDate: z.string()
    .datetime("Invalid date format")
    .optional()
    .transform(val => val ? new Date(val) : undefined),
  endDate: z.string()
    .datetime("Invalid date format")
    .optional()
    .transform(val => val ? new Date(val) : undefined)
})

// Admin action validation schemas
export const changeRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  role: z.nativeEnum(Role, { 
    errorMap: () => ({ message: "Invalid role" }) 
  })
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID format"),
  status: z.nativeEnum(PaymentStatus, { 
    errorMap: () => ({ message: "Invalid payment status" }) 
  }),
  transactionId: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

// Profile update validation schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10).max(15).regex(/^[+\d\s()-]+$/, "Invalid phone").optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  department: z.string().min(1).max(100),
  semester: z.number().int().min(1).max(8).optional().nullable(),
  college: z.string().min(1).max(100),
  usn: z.string().min(1).max(20).regex(/^[a-zA-Z0-9-]+$/, "Invalid USN").optional().nullable(),
  accommodation: z.boolean().optional().default(false),
});

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