/**
 * Next.js Middleware for Authentication
 *
 * Handles route protection and authentication checks.
 * Features:
 * - JWT token validation using NextAuth
 * - Automatic redirect to login for unauthenticated users
 * - Protection of the main application route (/)
 * - Secure token verification with environment secret
 */

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Middleware function for authentication and route protection
 *
 * @param req - Next.js request object
 * @returns NextResponse with redirect or continuation
 */
export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/auth/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
