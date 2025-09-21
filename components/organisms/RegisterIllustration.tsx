import { AuthIllustration } from "../atoms/AuthIllustration";

interface RegisterIllustrationProps {
  className?: string;
}

export const RegisterIllustration: React.FC<RegisterIllustrationProps> = ({
  className = "",
}) => {
  return (
    <AuthIllustration
      className={className}
      alt="Register illustration showing data analysis dashboard"
    />
  );
};
