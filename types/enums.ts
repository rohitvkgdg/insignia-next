/**
 * Application-wide enum definitions to ensure consistent types
 * between client and server code without direct dependency on Prisma
 */

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum EventCategory {
  CENTRALIZED = 'CENTRALIZED',
  TECHNICAL = 'TECHNICAL',
  CULTURAL = 'CULTURAL',
  FINEARTS = 'FINEARTS',
  LITERARY = 'LITERARY',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  REFUNDED = 'REFUNDED',
}