import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"

import postgres from "postgres"

import * as schema from "./schema"

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,

  onnotice: (notice) => {
    console.log("[POSTGRES_NOTICE]", notice)
  },
})

console.log(
  "✅ Database connection initialized"
)

export const db = drizzle(client, {
  schema,
})