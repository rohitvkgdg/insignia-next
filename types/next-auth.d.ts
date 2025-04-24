import NextAuth, { DefaultSession } from "next-auth"
import { Role } from "@/types/enums"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      role: Role
      profileCompleted: boolean
    } & DefaultSession["USER"]
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