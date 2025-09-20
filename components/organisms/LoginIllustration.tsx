import React from "react";
import Image from "next/image";

interface LoginIllustrationProps {
  className?: string;
}

export const LoginIllustration: React.FC<LoginIllustrationProps> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-full max-w-lg h-[500px] flex items-center justify-center">
        <Image
          src="/login_art.svg"
          alt="Login illustration showing data analysis dashboard"
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
