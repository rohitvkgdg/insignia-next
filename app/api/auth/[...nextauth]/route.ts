import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { NextAuthOptions } from "next-auth"

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
          // Only select fields that exist in the User model
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
        } catch (error) {
          console.error("Error fetching user data for session:", error)
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async signIn({ user, account, profile }) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (!existingUser) {
        // If the user doesn't exist, create a new one
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: Role.USER, // Default role for new users
            profileCompleted: false, // Default value for new users
          },
        })
      }
      if (account!.provider === "google") {
        // Check if the user has completed their profile
        const isProfileCompleted = await prisma.user.findUnique({
          where: { email: user.email },
          select: { profileCompleted: true },
        })
        if (isProfileCompleted && !isProfileCompleted.profileCompleted) {
          // If the profile is not completed, redirect to the profile completion page
          return "/profile/complete"
        }
      }
      return true
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }