import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
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
  };

  const baseClasses =
    "rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 overflow-hidden";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
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
