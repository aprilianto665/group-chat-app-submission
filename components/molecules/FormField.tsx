/**
 * FormField Component
 *
 * A wrapper component that combines Input with a label.
 * Features:
 * - Forward ref support for form libraries
 * - Consistent spacing and styling
 * - Label integration with input field
 * - Reusable form field pattern
 */

import { forwardRef } from "react";
import { Input } from "../atoms/Input";

/**
 * Props interface for FormField component
 */
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * FormField Component Implementation
 *
 * Renders an input field with an integrated label.
 * Uses forwardRef for compatibility with form libraries.
 *
 * @param label - Label text for the input field
 * @param props - Other input HTML attributes
 * @param ref - Forwarded ref to the input element
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Input ref={ref} label={label} {...props} />
      </div>
    );
  }
);

FormField.displayName = "FormField";
