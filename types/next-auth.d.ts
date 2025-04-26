import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@/types/enums"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      numericId: number
      role: Role
      profileCompleted: boolean
    } & DefaultSession["USER"]
  }

  /**
   * Extend the built-in JWT token types
   */
  interface JWT {
    id?: string
    numericId?: number
    role?: Role
  }

  /**
   * Extend the built-in User types
   */
  interface User {
    numericId: number
    role?: Role
    profileCompleted?: boolean
  }
}