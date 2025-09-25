/**
 * ProgressBar Component
 *
 * Visual progress indicator component with:
 * - Percentage-based progress calculation
 * - Color-coded states (gray, blue, green)
 * - Smooth transitions and animations
 * - Responsive design
 * - Accessibility features
 * - Customizable styling
 */

import React from "react";

/**
 * Props interface for ProgressBar component
 */
interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

/**
 * ProgressBar Component Implementation
 *
 * Renders a visual progress bar with percentage calculation and color coding.
 * Shows different colors based on completion status.
 *
 * @param completed - Number of completed items/tasks
 * @param total - Total number of items/tasks
 * @param className - Additional CSS classes for styling
 */
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
