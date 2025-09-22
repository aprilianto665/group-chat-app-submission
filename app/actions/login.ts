"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt-ts";
import { loginSchema } from "@/utils/validation/auth";

export type LoginActionState = {
  error?: string;
  ok?: boolean;
  email?: string;
  password?: string;
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const parsed = loginSchema.safeParse({
      email: (formData.get("email") as string | null) ?? "",
      password: (formData.get("password") as string | null) ?? "",
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid input" };
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
    console.error("Login action error:", error);
    return { error: "Internal server error" };
  }
}
