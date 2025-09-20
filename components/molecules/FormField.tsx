import { forwardRef } from "react";
import { Input } from "../atoms/Input";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

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
