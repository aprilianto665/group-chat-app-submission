import React from "react";
import { SpaceItem } from "./SpaceItem";
import type { Space } from "@/types";

interface SpaceListProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
}

export const SpaceList: React.FC<SpaceListProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
}) => {
  return (
    <>
      {spaces.map((space) => (
        <SpaceItem
          key={space.id}
          name={space.name}
          lastMessage={space.lastMessage}
          unreadCount={space.unreadCount}
          isActive={activeSpaceId === space.id}
          onClick={() => onSelectSpace?.(space.id)}
        />
      ))}
    </>
  );
};
