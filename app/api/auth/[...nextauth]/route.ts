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
        const user = await createUser(profile);
        return {
          id: profile.sub,
          numericId: user.numericId,
          name: profile.name || "",
          email: profile.email || "",
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
        session.user.role = (token.role as Role) || Role.USER
        session.user.profileCompleted = (token.profileCompleted as boolean) || false
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

        if (account?.provider === "google") {
          // Check if user exists
          if (!profile?.email) return false;
          
          const existingUser = await db.query.user.findFirst({
            where: eq(userTable.email, profile.email)
          });
          
          if (!existingUser) {
            // Create new user with sequential numeric ID
            const newUser = await createUser(profile);
            await db.insert(userTable).values(newUser);
          }
        }

        // Check if this user exists already
        const existingUser = await db.query.user.findFirst({
          where: eq(userTable.email, user.email),
        })

        // For existing users, ensure we link the account properly
        if (existingUser) {
          const existingAccount = await db.query.account.findFirst({
            where: eq(accountTable.userId, existingUser.id),
          })

          // If this is a different provider but same email, we'll update the account
          if (existingAccount && existingAccount.provider !== account?.provider) {
            logger.info("Linking new provider to existing account", { 
              email: user.email,
              provider: account?.provider 
            })
          }
        }

        return true
      } catch (error) {
        logger.error("Error during sign-in:", { email: user.email, error })
        return false
      }
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }