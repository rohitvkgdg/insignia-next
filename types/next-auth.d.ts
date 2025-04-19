import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      role: Role
      profileCompleted: boolean
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in JWT token types
   */
  interface JWT {
    id?: string
    role?: Role
  }

  /**
   * Extend the built-in User types
   */
  interface User {
    role?: Role
    profileCompleted?: boolean
  }
}