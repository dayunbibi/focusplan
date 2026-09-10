import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI operations (migrate, introspect) should use the direct/unpooled connection;
    // the app runtime uses the pooled DATABASE_URL via @prisma/adapter-neon in src/lib/prisma.ts.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
