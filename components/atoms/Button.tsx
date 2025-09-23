import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "icon" | "send" | "text";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const isIconVariant = variant === "icon" || variant === "send";
  const isNoRing = isIconVariant || variant === "text";
  const focusClasses = isNoRing
    ? "focus:outline-none"
    : "focus:outline-none focus:ring-2 focus:ring-offset-2";
  const baseClasses = `font-medium transition-all duration-200 ease-in-out ${focusClasses}`;

  const variantClasses = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    icon: "text-gray-400 hover:text-gray-600",
    send: "bg-[#4F45E4] text-white hover:bg-[#4339D1] focus:ring-[#4F45E4]",
    text: "text-gray-600",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const iconSizeClasses = {
    sm: "w-8 h-8 p-0",
    md: "w-10 h-10 p-0",
    lg: "w-12 h-12 p-0",
  };

  const sizeClass = isIconVariant ? iconSizeClasses[size] : sizeClasses[size];

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClass}
        ${isIconVariant ? "flex items-center justify-center flex-shrink-0" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
