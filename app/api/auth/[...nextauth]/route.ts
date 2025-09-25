/**
 * NextAuth.js API Route Handler
 *
 * This file sets up the NextAuth.js API routes for authentication.
 * It handles all authentication-related HTTP requests including:
 * - Login/logout endpoints
 * - Session management
 * - OAuth callbacks
 * - CSRF protection
 * - JWT token handling
 *
 * The [...nextauth] catch-all route handles all NextAuth.js API endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 * - /api/auth/callback/[provider]
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js handler instance configured with our authentication options
 */
const handler = NextAuth(authOptions);

/**
 * Export the handler for both GET and POST HTTP methods
 * NextAuth.js requires both methods to handle different authentication flows
 */
export { handler as GET, handler as POST };
