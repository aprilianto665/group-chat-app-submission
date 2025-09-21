import Image from "next/image";

interface AuthIllustrationProps {
  className?: string;
  alt?: string;
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  className = "",
  alt = "Authentication illustration showing data analysis dashboard",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-full max-w-lg h-[500px] flex items-center justify-center">
        <Image
          src="/login_art.svg"
          alt={alt}
          width={500}
          height={400}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>
    </div>
  );
};
