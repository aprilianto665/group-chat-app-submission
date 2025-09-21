import React from "react";
import { SpaceItem } from "./SpaceItem";

interface Space {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface SpaceListProps {
  spaces: Space[];
  activeSpaceId?: string;
}

export const SpaceList: React.FC<SpaceListProps> = ({
  spaces,
  activeSpaceId,
}) => {
  return (
    <>
      {spaces.map((space) => (
        <SpaceItem
          key={space.id}
          id={space.id}
          name={space.name}
          lastMessage={space.lastMessage}
          unreadCount={space.unreadCount}
          isActive={activeSpaceId === space.id}
        />
      ))}
    </>
  );
};
