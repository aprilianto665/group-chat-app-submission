"use client";

import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  registerAction,
  type RegisterActionState,
} from "@/app/actions/register";

interface RegisterFormProps {
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = "",
}) => {
  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    registerAction,
    { error: "" }
  );
  const [clientError, setClientError] = useState("");

  const handleClientValidate = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";
    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError("Passwords do not match");
    }
  };

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="rounded-full px-8"
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </Button>
    );
  };

  return (
    <form
      className={`space-y-6 ${className}`}
      action={formAction}
      onSubmit={handleClientValidate}
    >
      {clientError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {clientError}
        </div>
      )}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}
      {state?.success && <SuccessAutoRedirect message={state.success} />}

      <FormField type="text" label="Name" name="name" required />

      <FormField type="text" label="Username" name="username" required />

      <FormField type="email" label="Email Address" name="email" required />

      <FormField type="password" label="Password" name="password" required />

      <FormField
        type="password"
        label="Confirm Password"
        name="confirmPassword"
        required
      />

      <div className="text-left">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="flex justify-start">
        <SubmitButton />
      </div>
    </form>
  );
};

const SuccessAutoRedirect: React.FC<{ message: string }> = ({ message }) => {
  const { pending } = useFormStatus();
  if (pending) return null;

  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.location.href =
        "/auth/login?message=Registration%20successful!%20Please%20sign%20in.";
    }, 1500);
  }

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
      {message}
    </div>
  );
};
