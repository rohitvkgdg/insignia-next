import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"
// Import from our local enums instead of directly from Prisma
import { Role } from "@/types/enums"
import { logger } from "@/lib/logger"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || null,
          email: profile.email || null,
          image: profile.picture || null,
          role: Role.USER, // Default role for new users
          profileCompleted: false, // Default value for new users
        }
      }
    }),
  ],
  // Use a FIXED secret (ideally from .env) - changing this will invalidate all sessions
  secret: process.env.NEXTAUTH_SECRET || "secure-fixed-fallback-dont-change-me-in-production",
  session: {
    strategy: "jwt", // Use JWT strategy for sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        
        // Cast undefined to proper types
        session.user.role = (token.role as Role) || Role.USER
        session.user.profileCompleted = (token.profileCompleted as boolean) || false
        
        try {
          // Only fetch from DB if needed
          if (typeof token.role === 'undefined' || typeof token.profileCompleted === 'undefined') {
            const user = await prisma.user.findUnique({
              where: { id: token.sub },
              select: {
                role: true,
                profileCompleted: true
              }
            })
            if (user) {
              session.user.role = user.role
              session.user.profileCompleted = user.profileCompleted
            }
          }
        } catch (error) {
          logger.error("Error fetching user data for session:", { userId: token.sub, error })
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.profileCompleted = user.profileCompleted
      }
      return token
    },
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          logger.error("Sign-in attempt without email", { userId: user.id })
          return false
        }

        try {
          // First check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!existingUser) {
            // Create new user
            logger.info("Creating new user account", { email: user.email })
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: Role.USER,
                profileCompleted: false,
              },
            })
            return true
          } 
          
          // User exists, check if we need to link this account provider
          if (account) {
            const existingAccount = await prisma.account.findFirst({
              where: { 
                userId: existingUser.id,
                provider: account.provider 
              }
            })
            
            if (!existingAccount) {
              // Link this provider to the existing account
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token || null,
                  access_token: account.access_token || null,
                  expires_at: account.expires_at || null,
                  token_type: account.token_type || null,
                  scope: account.scope || null,
                  id_token: account.id_token || null,
                  session_state: account.session_state || null
                }
              })
            }
          }
          
          return true
        } catch (dbError) {
          logger.error("Database error during sign-in:", { email: user.email, error: dbError })
          return "/auth/signin?error=DatabaseError"
        }
      } catch (error) {
        logger.error("Error during sign-in process:", { email: user.email, error })
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect for profile completion
      if (url === `${baseUrl}/api/auth/callback/google`) {
        // After Google OAuth callback, check if user needs to complete their profile
        const lastSession = await prisma.session.findFirst({
          orderBy: { expires: 'desc' },
          select: { userId: true },
        })
        
        if (lastSession) {
          const user = await prisma.user.findUnique({
            where: { id: lastSession.userId },
            select: { profileCompleted: true }
          })
          
          if (user && !user.profileCompleted) {
            return `${baseUrl}/profile`
          }
        }
      }
      
      // Default NextAuth behavior
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    }
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }