"use client";

/**
 * SpaceList Component
 *
 * Renders a list of spaces with:
 * - Individual space items with avatars and last messages
 * - Active state highlighting
 * - Click handling for space selection
 * - Performance optimization with memoization
 * - Keyboard accessibility support
 */

import React, { memo, useCallback } from "react";
import { SpaceItem } from "./SpaceItem";
import type { Space } from "@/types";

/**
 * Props interface for SpaceList component
 */
interface SpaceListProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
}

/**
 * SpaceList Component Implementation
 *
 * Renders a list of spaces with selection handling.
 * Uses memoization for performance optimization.
 *
 * @param spaces - Array of spaces to display
 * @param activeSpaceId - ID of the currently active space
 * @param onSelectSpace - Callback when a space is selected
 */
const SpaceListComponent: React.FC<SpaceListProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
}) => {
  const handleSelect = useCallback(
    (spaceId: string) => {
      onSelectSpace?.(spaceId);
    },
    [onSelectSpace]
  );
  return (
    <>
      {spaces.map((space) => (
        <SpaceItem
          key={space.id}
          name={space.name}
          icon={space.icon}
          lastMessage={space.lastMessage}
          lastMessageSender={space.lastMessageSender}
          isActive={activeSpaceId === space.id}
          onClick={() => handleSelect(space.id)}
        />
      ))}
    </>
  );
};

export const SpaceList = memo(SpaceListComponent);
