"use client";

/**
 * Tooltip Component
 *
 * Interactive tooltip component with:
 * - Four position options (top, bottom, left, right)
 * - Configurable delay for show/hide
 * - Keyboard accessibility support (focus/blur)
 * - Automatic cleanup of timeouts
 * - Arrow indicators for better UX
 * - High z-index for proper layering
 * - Responsive positioning
 */

import React, { useState, useRef, useEffect } from "react";

/**
 * Props interface for Tooltip component
 */
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

/**
 * Tooltip Component Implementation
 *
 * Renders an interactive tooltip with configurable position and delay.
 * Handles mouse and keyboard interactions with proper cleanup.
 *
 * @param content - Tooltip text content
 * @param children - Element that triggers the tooltip
 * @param position - Tooltip position relative to trigger element
 * @param delay - Delay in milliseconds before showing tooltip
 * @param className - Additional CSS classes
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-900",
    right: "right-full top-1/2 transform -translate-y-1/2 border-r-gray-900",
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-30 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};
