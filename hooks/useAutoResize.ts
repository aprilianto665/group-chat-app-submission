/**
 * Auto Resize Hook
 *
 * Custom hook for automatically resizing textarea elements based on their content.
 * Provides utilities for dynamic height adjustment without scrollbars.
 */

import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook that provides auto-resize functionality for textarea elements
 *
 * Returns two utilities:
 * - autoResize: Function to manually resize an element
 * - useAutoResizeRef: Hook that returns a ref with automatic resize behavior
 *
 * @returns Object containing autoResize function and useAutoResizeRef hook
 */
export const useAutoResize = () => {
  /**
   * Manually resizes a textarea element to fit its content
   * Sets height to 'auto' first, then to the element's scrollHeight
   *
   * @param element - The HTML element to resize (usually a textarea)
   */
  const autoResize = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  /**
   * Hook that creates a ref with automatic resize behavior
   * The returned ref will automatically resize its element on every render
   *
   * @returns Ref object for a textarea element with auto-resize functionality
   */
  const useAutoResizeRef = () => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (ref.current) {
        autoResize(ref.current);
      }
    });

    return ref;
  };

  return { autoResize, useAutoResizeRef };
};
