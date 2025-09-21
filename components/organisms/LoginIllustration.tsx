import { AuthIllustration } from "../atoms/AuthIllustration";

interface LoginIllustrationProps {
  className?: string;
}

export const LoginIllustration: React.FC<LoginIllustrationProps> = ({
  className = "",
}) => {
  return (
    <AuthIllustration
      className={className}
      alt="Login illustration showing data analysis dashboard"
    />
  );
};
