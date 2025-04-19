/**
 * Application-wide enum definitions to ensure consistent types
 * between client and server code without direct dependency on Prisma
 */

export enum Role {
  USER = "USER",
  COORDINATOR = "COORDINATOR",
  ADMIN = "ADMIN"
}

export enum Category {
  CENTRALIZED = "CENTRALIZED",
  DEPARTMENT = "DEPARTMENT",
  CULTURAL = "CULTURAL"
}

export enum RegistrationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  REFUNDED = "REFUNDED"
}