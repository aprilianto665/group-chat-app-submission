"use client";

import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import Link from "next/link";
import { useActionState, useEffect } from "react";
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

  useEffect(() => {
    const doSignIn = async () => {
      if (state?.ok && state.email && state.password) {
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
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="rounded-full px-8"
        >
          Sign in
        </Button>
      </div>
    </form>
  );
};
