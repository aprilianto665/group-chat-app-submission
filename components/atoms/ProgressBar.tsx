import React from "react";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  className = "",
}) => {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-1 overflow-hidden ${className}`}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          progressPercentage === 100
            ? "bg-green-500"
            : progressPercentage > 0
            ? "bg-blue-500"
            : "bg-gray-300"
        }`}
        style={{
          width: `${Math.max(progressPercentage, 2)}%`,
        }}
      />
    </div>
  );
};
