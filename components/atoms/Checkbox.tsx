import { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
