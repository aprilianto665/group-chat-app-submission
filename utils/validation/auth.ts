import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(32)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, underscore"
      ),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
