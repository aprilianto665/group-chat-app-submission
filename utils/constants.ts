/**
 * Application Constants
 *
 * This module contains all application-wide constants including:
 * - Drag and drop constraints
 * - UI animation and z-index values
 * - Color palette for consistent theming
 * - Spacing values for consistent layout
 */

/**
 * Drag and drop constraints for interactive elements
 */
export const DRAG_CONSTRAINTS = {
  DISTANCE: 5,
} as const;

/**
 * UI constants for animations, z-index, and other UI properties
 */
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  Z_INDEX: {
    DROPDOWN: 10,
    MODAL: 50,
    DRAGGING: 60,
    TOOLTIP: 30,
  },
} as const;

/**
 * Color palette for consistent theming across the application
 */
export const COLORS = {
  PRIMARY: "#4F45E4",
  PRIMARY_HOVER: "#4339D1",
  SUCCESS: "#10B981",
  SUCCESS_HOVER: "#059669",
  DANGER: "#EF4444",
  DANGER_HOVER: "#DC2626",
  WARNING: "#F59E0B",
  WARNING_HOVER: "#D97706",
} as const;

/**
 * Spacing values for consistent layout and spacing
 */
export const SPACING = {
  XS: "0.25rem",
  SM: "0.5rem",
  MD: "1rem",
  LG: "1.5rem",
  XL: "2rem",
} as const;
