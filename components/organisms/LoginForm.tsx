"use client";

import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import { loginAction, type LoginActionState } from "@/app/actions/login";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const router = useRouter();
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    loginAction,
    {}
  );
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const doSignIn = async () => {
      if (state?.ok && state.email && state.password) {
        try {
          setIsSigningIn(true);
          const result = await signIn("credentials", {
            redirect: false,
            email: state.email,
            password: state.password,
            callbackUrl: "/",
          });
          if (result?.error) {
            return;
          }
          if (result?.ok) {
            router.replace(result.url ?? "/");
          }
        } finally {
          setIsSigningIn(false);
        }
      }
    };
    void doSignIn();
  }, [state?.ok, state?.email, state?.password, router]);

  return (
    <form className={`space-y-6 ${className}`} action={formAction}>
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <FormField type="email" label="Email Address" name="email" required />

      <FormField type="password" label="Password" name="password" required />

      <div className="text-left">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>

      <div className="flex justify-start">
        <SubmitButton isSigningIn={isSigningIn} />
      </div>
    </form>
  );
};

const SubmitButton: React.FC<{ isSigningIn: boolean }> = ({ isSigningIn }) => {
  const { pending } = useFormStatus();
  const disabled = pending || isSigningIn;
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      className="rounded-full px-8"
      disabled={disabled}
    >
      {disabled ? "Signing in..." : "Sign in"}
    </Button>
  );
};
