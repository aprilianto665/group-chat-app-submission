import { FormField } from "../molecules/FormField";
import { Button } from "../atoms/Button";

interface LoginFormProps {
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  return (
    <form className={`space-y-6 ${className}`}>
      <FormField type="email" label="Email Address" />

      <FormField type="password" label="Password" />

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
