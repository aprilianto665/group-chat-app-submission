/**
 * Prisma Database Client Configuration
 *
 * This module configures the Prisma client for database operations.
 * Uses singleton pattern to prevent multiple client instances in development.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client instance for database operations
 * Singleton pattern ensures single instance across the application
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
