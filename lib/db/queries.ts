import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { user, account, session, registration, event } from "@/schema"

export const queries = {
  getUserById: db.query.user.findFirst({
    where: eq(user.id, undefined as unknown as string),
    with: {
      registrations: {
        with: {
          event: true,
        }
      }
    }
  }),
  getUserByEmail: db.query.user.findFirst({
    where: eq(user.email, undefined as unknown as string),
  }),
} as const;