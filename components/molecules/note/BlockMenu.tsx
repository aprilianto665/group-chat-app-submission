"use client";

/**
 * BlockMenu Component
 *
 * Context menu for note blocks with:
 * - Delete block functionality
 * - Conditional rendering based on open state
 * - Icon button with hover effects
 * - Accessibility features with aria-label
 * - Performance optimization with memoization
 * - Positioned overlay design
 */

import React, { memo } from "react";
import { Button } from "../../atoms/Button";
import { TrashIcon } from "../../atoms/Icons";

/**
 * Props interface for BlockMenu component
 */
interface BlockMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

/**
 * BlockMenu Component Implementation
 *
 * Renders a context menu for note blocks with delete functionality.
 * Only renders when isOpen is true, providing conditional visibility.
 *
 * @param isOpen - Whether the menu is currently open
 * @param onClose - Callback function to close the menu
 * @param onDelete - Callback function to delete the block
 */
const BlockMenuComponent: React.FC<BlockMenuProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-3 top-4 mt-2 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
      <Button
        variant="icon"
        size="sm"
        className="text-gray-700 hover:text-red-600 focus:outline-none focus:ring-0 focus:ring-offset-0"
        onClick={() => {
          onClose();
          onDelete();
        }}
        aria-label="Delete block"
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const BlockMenu = memo(BlockMenuComponent);
