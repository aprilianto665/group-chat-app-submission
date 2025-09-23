"use client";

import React, { memo } from "react";

interface SaveButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const SaveButtonComponent: React.FC<SaveButtonProps> = ({
  isVisible,
  onClick,
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Save note"
      className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-md"
    >
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
    </button>
  );
};

export const SaveButton = memo(SaveButtonComponent);
