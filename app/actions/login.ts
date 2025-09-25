"use server";

/**
 * Authentication Server Actions
 *
 * This module handles user login operations including:
 * - Form data validation with Zod schemas
 * - User authentication with bcrypt password comparison
 * - Error handling and user feedback
 * - Integration with NextAuth.js for session management
 */

import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt-ts";
import { loginSchema } from "@/utils/validation/auth";
import {
  handleActionError,
  getFirstValidationError,
  getFormDataValue,
} from "@/utils/actionUtils";

/**
 * State type for login action results
 */
export type LoginActionState = {
  error?: string;
  ok?: boolean;
  email?: string;
  password?: string;
};

/**
 * Handles user login form submission
 * Validates credentials and returns appropriate state for UI feedback
 *
 * @param _prev - Previous state (unused)
 * @param formData - Form data containing email and password
 * @returns LoginActionState with success/error information
 */
export async function loginAction(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const parsed = loginSchema.safeParse({
      email: getFormDataValue(formData, "email"),
      password: getFormDataValue(formData, "password"),
    });

    if (!parsed.success) {
      return { error: getFirstValidationError(parsed.error) };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    return { ok: true, email, password };
  } catch (error) {
    return handleActionError(error, "Login action");
  }
}
