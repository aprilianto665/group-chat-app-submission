import { ZodError } from "zod";

/**
 * Standard action result type for form actions
 */
export type ActionResult<T = Record<string, never>> = {
  error?: string;
  success?: string;
} & T;

/**
 * Handles common error patterns in server actions
 */
export const handleActionError = (
  error: unknown,
  actionName: string,
  fallbackMessage = "Internal server error"
): { error: string } => {
  console.error(`${actionName} error:`, error);
  return { error: fallbackMessage };
};

/**
 * Extracts the first validation error from a Zod result
 */
export const getFirstValidationError = (error: ZodError): string => {
  return error.errors[0]?.message || "Invalid input";
};

/**
 * Safely extracts form data with fallback to empty string
 */
export const getFormDataValue = (formData: FormData, key: string): string => {
  return (formData.get(key) as string | null) ?? "";
};

/**
 * Safely extracts and trims form data
 */
export const getFormDataValueTrimmed = (
  formData: FormData,
  key: string
): string => {
  return getFormDataValue(formData, key).trim();
};

/**
 * Safely extracts optional form data (returns undefined if empty)
 */
export const getFormDataValueOptional = (
  formData: FormData,
  key: string
): string | undefined => {
  const value = getFormDataValueTrimmed(formData, key);
  return value || undefined;
};
