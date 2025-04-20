import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { Role } from "@/types/enums"
import { logger } from "@/lib/logger"
import { DrizzleAdapter } from "@/lib/auth/drizzle-adapter"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { user as userTable, account as accountTable, session as sessionTable } from "@/schema"

// Verify required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not set in .env.local`);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(),
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
          role: Role.USER,
          profileCompleted: false,
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
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
        
        try {
          session.user.role = (token.role as Role) || Role.USER
          session.user.profileCompleted = (token.profileCompleted as boolean) || false
          
          // Only fetch from DB if needed
          if (typeof token.role === 'undefined' || typeof token.profileCompleted === 'undefined') {
            const userData = await db.query.user.findFirst({
              where: eq(userTable.id, token.sub),
              columns: {
                role: true,
                profileCompleted: true
              }
            });
            
            if (userData) {
              session.user.role = userData.role
              session.user.profileCompleted = userData.profileCompleted
            }
          }
        } catch (error) {
          logger.error("Error fetching user data for session:", { userId: token.sub, error })
          // Continue with default values on error
          session.user.role = Role.USER
          session.user.profileCompleted = false
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
          // Check if user exists
          const existingUser = await db.query.user.findFirst({
            where: eq(userTable.email, user.email!)
          });

          if (!existingUser) {
            // Create new user
            logger.info("Creating new user account", { email: user.email })
            await db.insert(userTable).values({
              id: user.id!,
              email: user.email!,
              name: user.name!,
              image: user.image!,
              role: Role.USER,
              profileCompleted: false,
            });
          }
          
          return true
        } catch (dbError) {
          logger.error("Database error during sign-in:", { email: user.email, error: dbError })
          throw new Error("Database connection error. Please try again later.")
        }
      } catch (error) {
        logger.error("Error during sign-in process:", { email: user.email, error })
        return false
      }
    },
    async redirect({ url, baseUrl }) {
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