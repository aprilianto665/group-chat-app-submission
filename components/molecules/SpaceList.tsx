import React, { memo, useCallback } from "react";
import { SpaceItem } from "./SpaceItem";
import type { Space } from "@/types";

interface SpaceListProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
}

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
          lastMessage={space.lastMessage}
          unreadCount={space.unreadCount}
          isActive={activeSpaceId === space.id}
          onClick={() => handleSelect(space.id)}
        />
      ))}
    </>
  );
};

export const SpaceList = memo(SpaceListComponent);
