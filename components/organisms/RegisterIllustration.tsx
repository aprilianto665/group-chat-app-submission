import React from "react";
import Image from "next/image";

interface RegisterIllustrationProps {
  className?: string;
}

export const RegisterIllustration: React.FC<RegisterIllustrationProps> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-full max-w-lg h-[500px] flex items-center justify-center">
        <Image
          src="/login_art.svg"
          alt="Register illustration showing data analysis dashboard"
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
