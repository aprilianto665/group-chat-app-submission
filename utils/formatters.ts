/**
 * Formatting Utility Functions
 *
 * This module provides common formatting utilities for various data types.
 * Includes functions for file sizes, numbers, currency, text manipulation, and time formatting.
 */

// ===== FILE AND NUMBER FORMATTING =====

/**
 * Formats file size in bytes to human-readable format
 * Converts bytes to appropriate unit (Bytes, KB, MB, GB) with 2 decimal places
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Formats a number with locale-specific thousands separators
 * Uses browser's default locale for number formatting
 *
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Formats a number as currency with specified currency code
 * Uses US locale formatting with customizable currency
 *
 * @param amount - Amount to format as currency
 * @param currency - Currency code (default: "USD")
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Formats a decimal value as a percentage
 * Converts decimal to percentage with specified decimal places
 *
 * @param value - Decimal value (0.1 = 10%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "10.5%")
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ===== TEXT FORMATTING =====

/**
 * Truncates text to specified length and adds ellipsis
 * Returns original text if it's shorter than maxLength
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalizes the first letter and lowercases the rest
 * Converts text to title case format
 *
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 */
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Extracts initials from a full name
 * Takes first letter of each word, up to 2 characters
 *
 * @param name - Full name to extract initials from
 * @returns Initials string (e.g., "John Doe" → "JD")
 */
export const formatInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

// ===== TIME FORMATTING =====

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * Provides human-readable time differences from now
 *
 * @param date - Date object or date string to format
 * @returns Relative time string (e.g., "just now", "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};
