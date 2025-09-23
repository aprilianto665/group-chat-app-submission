import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
  children,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    xxl: "w-20 h-20 text-2xl",
  } as const;

  const baseClasses =
    "rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 overflow-hidden";

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={
          size === "sm"
            ? 32
            : size === "md"
            ? 40
            : size === "lg"
            ? 48
            : size === "xl"
            ? 64
            : 80
        }
        height={
          size === "sm"
            ? 32
            : size === "md"
            ? 40
            : size === "lg"
            ? 48
            : size === "xl"
            ? 64
            : 80
        }
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};
