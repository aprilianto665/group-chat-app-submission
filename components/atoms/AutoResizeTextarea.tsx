"use client";

/**
 * AutoResizeTextarea Component
 *
 * A textarea component that automatically adjusts its height based on content.
 * Features:
 * - Automatic height adjustment on content change
 * - Prevents manual resizing (resize-none)
 * - Maintains scroll behavior for overflow
 * - Forward ref support for form libraries
 */

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
