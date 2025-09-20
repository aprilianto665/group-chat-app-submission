import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";
import Link from "next/link";

interface RegisterFormProps {
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = "",
}) => {
  return (
    <form className={`space-y-6 ${className}`}>
      <FormField type="text" label="Name" />

      <FormField type="text" label="Username" />

      <FormField type="email" label="Email Address" />

      <FormField type="password" label="Password" />

      <FormField type="password" label="Confirm Password" />

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
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="rounded-full px-8"
        >
          Create account
        </Button>
      </div>
    </form>
  );
};
