/**
 * Date Utility Functions
 *
 * This module provides utilities for date formatting and manipulation:
 * - Human-readable date formatting (Today, Yesterday, etc.)
 * - Time formatting with 12-hour format
 * - Message grouping by date for chat interfaces
 */

/**
 * Formats a date string into a human-readable format
 * Shows "Today", "Yesterday", or full date for older dates
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a date string into a 12-hour time format
 *
 * @param dateString - ISO date string to format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Groups messages by their date for display purposes
 *
 * @param messages - Array of objects with timestamp property
 * @returns Object with date strings as keys and message arrays as values
 */
export const groupMessagesByDate = <T extends { timestamp: string }>(
  messages: T[]
): { [key: string]: T[] } => {
  const grouped: { [key: string]: T[] } = {};

  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();
    if (!grouped[messageDate]) {
      grouped[messageDate] = [];
    }
    grouped[messageDate].push(message);
  });

  return grouped;
};
