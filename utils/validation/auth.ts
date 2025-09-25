/**
 * Authentication Validation Schemas
 *
 * This module contains Zod validation schemas for user authentication operations.
 * Includes schemas for user registration and login with comprehensive validation rules.
 */

import { z } from "zod";

/**
 * Schema for user registration form validation
 * Validates all registration fields with custom error messages and password confirmation
 */
export const registerSchema = z
  .object({
    /** User's full name (trimmed, required, max 100 characters) */
    name: z.string().trim().min(1, "Name is required").max(100),

    /** Username (trimmed, 3-32 characters, alphanumeric + underscore only) */
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(32)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, underscore"
      ),

    /** Email address (trimmed, lowercase, valid email format) */
    email: z.string().trim().toLowerCase().email("Invalid email address"),

    /** Password (8-72 characters for security) */
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),

    /** Password confirmation (must match password) */
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * TypeScript type inferred from the registration schema
 * Used for type safety in registration forms and server actions
 */
export type RegisterSchemaInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login form validation
 * Validates email and password for authentication
 */
export const loginSchema = z.object({
  /** Email address (trimmed, lowercase, valid email format) */
  email: z.string().trim().toLowerCase().email("Invalid email address"),

  /** Password (required, non-empty) */
  password: z.string().min(1, "Password is required"),
});

/**
 * TypeScript type inferred from the login schema
 * Used for type safety in login forms and server actions
 */
export type LoginSchemaInput = z.infer<typeof loginSchema>;
