import Image from "next/image";

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
      <Image
        src={src}
        alt={alt}
        width={size === "sm" ? 32 : size === "md" ? 40 : 48}
        height={size === "sm" ? 32 : size === "md" ? 40 : 48}
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
