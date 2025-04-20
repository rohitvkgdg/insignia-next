import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/schema";

declare global {
  var cachedConnection: ReturnType<typeof neon> | undefined;
}

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error(
    'Do not import database client directly in components. Use server actions instead.'
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set in .env.local');
}

// In development, we want to cache the SQL connection
const sql = global.cachedConnection || neon(process.env.DATABASE_URL);

// Cache the connection in development
if (process.env.NODE_ENV === 'development') {
  global.cachedConnection = sql;
}

export const db = drizzle(sql, { schema });
