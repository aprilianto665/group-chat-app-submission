import { useCallback, useEffect, useRef } from "react";

export const useAutoResize = () => {
  const autoResize = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, []);

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
