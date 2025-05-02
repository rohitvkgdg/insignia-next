import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { Role } from "@/types/enums"
import { logger } from "@/lib/logger"
import { DrizzleAdapter } from "@/lib/auth/drizzle-adapter"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { user as userTable, account as accountTable } from "@/schema"
import { generateUserId } from "@/lib/server-utils"
import { getServerSession } from "next-auth/next"

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

async function createUser(profile: any) {
  try {
    const numericId = parseInt(await generateUserId());
    
    return {
      id: profile.sub, // Keep original OAuth ID as primary key
      numericId, // Add the sequential numeric ID
      name: profile.name || "",
      email: profile.email || "",
      role: Role.USER,
      profileCompleted: false,
    };
  } catch (error) {
    logger.error("Error generating user ID", { error });
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile) {
        const newUser = await createUser(profile);
        return {
          ...newUser,
          image: profile.image,
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
        session.user.role = (token.role as Role) || Role.USER
        session.user.profileCompleted = (token.profileCompleted as boolean) || false
      }
      return session
    },
    async jwt({ token, user: authUser, account, profile }) {
      if (authUser) {
        token.role = authUser.role
        token.profileCompleted = authUser.profileCompleted
      }

      // If this is a sign-in event, check profile completion
      if (account && profile && token.sub) {
        const dbUser = await db.query.user.findFirst({
          where: eq(userTable.id, token.sub)
        });
        if (dbUser) {
          token.profileCompleted = dbUser.profileCompleted
        }
      }
      
      return token
    },
    async signIn({ user: authUser, account, profile }) {
      try {
        if (!authUser.email) {
          logger.error("Sign-in attempt without email", { userId: authUser.id })
          return false
        }

        if (account?.provider === "google" && profile?.email) {
          const existingUser = await db.query.user.findFirst({
            where: eq(userTable.email, profile.email)
          });
          
          if (!existingUser) {
            const newUser = await createUser(profile);
            await db.insert(userTable).values({
              id: newUser.id,
              numericId: newUser.numericId,
              name: newUser.name || null,
              email: newUser.email,
              role: newUser.role,
              profileCompleted: false,
            });
          }
        }

        return true
      } catch (error) {
        logger.error("Error during sign-in:", { email: authUser.email, error: error instanceof Error ? error.message : String(error) })
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // If it's a relative callback URL, make it absolute
        if (url.startsWith('/')) url = `${baseUrl}${url}`
        
        // For sign in/callback, check profile completion
        if (url.includes('signin') || url.includes('callback')) {
          const session = await getServerSession(authOptions);
          if (session?.user?.email) {
            const currentUser = await db.query.user.findFirst({
              where: eq(userTable.email, session.user.email)
            });

            // If profile is incomplete, redirect to profile page with original URL as callback
            if (!session.user.profileCompleted) {
                return `${baseUrl}/profile`;
            }
          }
        }

        // Allow redirects within the same site
        if (url.startsWith(baseUrl)) return url;
        return baseUrl;
      } catch (error) {
        logger.error("Error in redirect callback:", { error: error instanceof Error ? error.message : String(error) })
        return baseUrl;
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }