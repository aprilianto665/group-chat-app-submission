"use client";

/**
 * SpaceItem Component
 *
 * Individual space item component with:
 * - Space avatar with fallback to first letter
 * - Space name and last message display
 * - Active state highlighting
 * - Click and keyboard interaction
 * - Accessibility support with ARIA roles
 * - Performance optimization with memoization
 */

import React, { memo, useCallback } from "react";
import { Avatar } from "../../atoms/Avatar";

/**
 * Props interface for SpaceItem component
 */
interface SpaceItemProps {
  name: string;
  icon?: string;
  lastMessage?: string;
  lastMessageSender?: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * SpaceItem Component Implementation
 *
 * Renders an individual space item with avatar, name, and last message.
 * Handles click and keyboard interactions with accessibility support.
 *
 * @param name - Name of the space
 * @param icon - Optional icon URL for the space
 * @param lastMessage - Last message content
 * @param lastMessageSender - Sender of the last message
 * @param isActive - Whether this space is currently active
 * @param className - Additional CSS classes
 * @param onClick - Click handler for space selection
 */
const SpaceItemComponent: React.FC<SpaceItemProps> = ({
  name,
  icon,
  lastMessage,
  lastMessageSender,
  isActive = false,
  className = "",
  onClick,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        onClick?.();
      }
    },
    [onClick]
  );
  return (
    <div
      className={`
        flex items-center p-3
        ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""}
        ${className}
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <Avatar
        size="md"
        className="mr-3"
        src={icon && icon.length > 0 ? icon : undefined}
      >
        {(!icon || icon.length === 0) && name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-500 truncate mt-1">
            {lastMessageSender
              ? `${lastMessageSender}: ${lastMessage}`
              : lastMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export const SpaceItem = memo(SpaceItemComponent);
