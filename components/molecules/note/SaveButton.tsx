"use client";

import React, { memo } from "react";

interface SaveButtonProps {
  isVisible: boolean;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const SaveButtonComponent: React.FC<SaveButtonProps> = ({
  isVisible,
  onClick,
  disabled = false,
  isLoading = false,
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLoading ? "Saving note..." : "Save note"}
      className={`absolute bottom-3 right-3 h-10 w-10 rounded-full text-white flex items-center justify-center shadow-md transition-colors ${
        disabled || isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export const SaveButton = memo(SaveButtonComponent);
