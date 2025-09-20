import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent
            focus:ring-0 focus:border-blue-500 focus:outline-none
            transition-all duration-200 ease-in-out
            text-gray-900 placeholder:text-gray-400
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
