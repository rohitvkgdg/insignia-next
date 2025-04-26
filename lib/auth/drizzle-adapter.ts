import type { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters"
import { account, session, user } from "@/schema"
import { db } from "@/lib/db"
import { and, eq } from "drizzle-orm"
import { randomUUID } from "crypto"
import { generateUserId } from "@/lib/server-utils"

export function DrizzleAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const id = randomUUID()
      const numericId = parseInt(await generateUserId())

      const [newUser] = await db.insert(user)
        .values({
          id,
          numericId,
          name: data.name,
          email: data.email!,
          role: 'USER',
          profileCompleted: false,
        })
        .returning();
      
      return {
        ...newUser,
        email: newUser.email || '', // Ensure email is never null for AdapterUser
      } as AdapterUser;
    },

    async getUser(id) {
      const result = await db.query.user.findFirst({
        where: eq(user.id, id),
      });
      if (!result) return null;
      return {
        ...result,
        email: result.email || '', // Ensure email is never null for AdapterUser
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const result = await db.query.user.findFirst({
        where: eq(user.email, email),
      });
      if (!result) return null;
      return {
        ...result,
        email: result.email || '', // Ensure email is never null for AdapterUser
      } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await db.query.account.findFirst({
        where: and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId)
        ),
        with: {
          user: true,
        },
      });
      if (!result?.user) return null;
      return {
        ...result.user,
        email: result.user.email || '', // Ensure email is never null for AdapterUser
      } as AdapterUser;
    },

    async updateUser(data) {
      if (!data.id) throw new Error("No user id");

      const [updatedUser] = await db.update(user)
        .set({
          name: data.name,
          email: data.email,
        })
        .where(eq(user.id, data.id))
        .returning();
      
      return {
        ...updatedUser,
        email: updatedUser.email || '', // Ensure email is never null for AdapterUser
      } as AdapterUser;
    },

    async deleteUser(userId) {
      await db.delete(user).where(eq(user.id, userId));
    },

    async linkAccount(data: AdapterAccount) {
      const id = randomUUID()
      await db.insert(account)
        .values({
          id,
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await db.delete(account).where(
        and(
          eq(account.provider, provider),
          eq(account.providerAccountId, providerAccountId)
        )
      );
    },

    async createSession(data) {
      const id = randomUUID()
      const [newSession] = await db.insert(session)
        .values({
          id,
          userId: data.userId,
          expires: data.expires,
          sessionToken: data.sessionToken,
        })
        .returning();
      return newSession as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const result = await db.query.session.findFirst({
        where: eq(session.sessionToken, sessionToken),
        with: {
          user: true,
        },
      });

      if (!result) return null;
      
      const { user: userResult, ...sessionResult } = result;
      return {
        user: {
          ...userResult,
          email: userResult.email || '', // Ensure email is never null for AdapterUser
        } as AdapterUser,
        session: sessionResult as AdapterSession,
      };
    },

    async updateSession(data) {
      const [updatedSession] = await db.update(session)
        .set({
          expires: data.expires,
          sessionToken: data.sessionToken,
          userId: data.userId,
        })
        .where(eq(session.sessionToken, data.sessionToken))
        .returning();
      return updatedSession as AdapterSession || null;
    },

    async deleteSession(sessionToken) {
      await db.delete(session).where(eq(session.sessionToken, sessionToken));
    },
  };
}