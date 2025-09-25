/**
 * Validation Utility Functions
 *
 * This module provides common validation functions for form inputs:
 * - Required field validation
 * - Length validation (min/max)
 * - Email format validation
 * - Username format validation
 * - Password strength validation
 * - Form validation with multiple rules
 */

/**
 * Interface for validation results
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a field is not empty
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult indicating if the field is valid
 */
export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

/**
 * Validates that a string meets minimum length requirement
 *
 * @param value - The string value to validate
 * @param minLength - Minimum required length
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult indicating if the length is valid
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long`,
    };
  }
  return { isValid: true };
};

/**
 * Validates that a string doesn't exceed maximum length requirement
 *
 * @param value - The string value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult indicating if the length is valid
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters long`,
    };
  }
  return { isValid: true };
};

/**
 * Validates email format using regex
 *
 * @param email - Email address to validate
 * @returns ValidationResult indicating if the email is valid
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }
  return { isValid: true };
};

/**
 * Validates username format using regex
 * Ensures username contains only alphanumeric characters and underscores
 *
 * @param username - Username to validate
 * @returns ValidationResult indicating if the username format is valid
 */
export const validateUsername = (username: string): ValidationResult => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }
  return { isValid: true };
};

/**
 * Validates password strength requirements
 * Checks for minimum length and character variety (uppercase, lowercase, numbers)
 *
 * @param password - Password to validate
 * @returns ValidationResult indicating if the password meets strength requirements
 */
export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { isValid: true };
};

/**
 * Validates an entire form with multiple validation rules
 *
 * @param values - Object containing form field values
 * @param rules - Object mapping field names to validation functions
 * @returns Object with validation status and error messages
 */
export const validateForm = (
  values: Record<string, string>,
  rules: Record<string, (value: string) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, value] of Object.entries(values)) {
    const rule = rules[field];
    if (rule) {
      const result = rule(value);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
};
