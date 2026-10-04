import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";

// Node < 22 has no global WebSocket, so give the Neon driver the ws package
if (!(globalThis as { WebSocket?: unknown }).WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

// The Neon serverless driver talks to Neon over WebSockets, which a plain local
// Postgres can't accept. Use it for Neon and fall back to node-postgres otherwise.
function createAdapter() {
  const isNeon = connectionString?.includes(".neon.tech") ?? false;
  return isNeon ? new PrismaNeon({ connectionString }) : new PrismaPg({ connectionString });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
