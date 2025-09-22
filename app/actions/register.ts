"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt-ts";
import { registerSchema } from "@/utils/validation/auth";

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
      name: (formData.get("name") as string | null) ?? "",
      username: (formData.get("username") as string | null) ?? "",
      email: (formData.get("email") as string | null) ?? "",
      password: (formData.get("password") as string | null) ?? "",
      confirmPassword: (formData.get("confirmPassword") as string | null) ?? "",
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return { error: firstError };
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
      },
    });
  } catch (error) {
    console.error("Registration action error:", error);
    return { error: "Internal server error" };
  }

  return { success: "Registration successful! Redirecting to sign in..." };
}
