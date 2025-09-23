"use client";

import React, { forwardRef, useCallback } from "react";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className = "", onChange, ...props }, ref) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.currentTarget.style.height = "auto";
      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;

      onChange?.(e);
    },
    [onChange]
  );

  return (
    <textarea
      ref={ref}
      className={`resize-none overflow-hidden ${className}`}
      onChange={handleChange}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";
