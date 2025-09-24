"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt-ts";
import { registerSchema } from "@/utils/validation/auth";
import {
  handleActionError,
  getFirstValidationError,
  getFormDataValue,
} from "@/utils/actionUtils";

export type RegisterActionState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  try {
    const parsed = registerSchema.safeParse({
      name: getFormDataValue(formData, "name"),
      username: getFormDataValue(formData, "username"),
      email: getFormDataValue(formData, "email"),
      password: getFormDataValue(formData, "password"),
      confirmPassword: getFormDataValue(formData, "confirmPassword"),
    });

    if (!parsed.success) {
      return { error: getFirstValidationError(parsed.error) };
    }

    const { name, username, email, password } = parsed.data;

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return { error: "Email already exists" };
    }

    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return { error: "Username already exists" };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        avatar: "/avatar_default.jpg",
      },
    });
  } catch (error) {
    return handleActionError(error, "Registration action");
  }

  return { success: "Registration successful! Redirecting to sign in..." };
}
