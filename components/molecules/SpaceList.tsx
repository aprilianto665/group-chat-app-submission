import React from "react";
import { SpaceItem } from "./SpaceItem";
import { SearchInput } from "./SearchInput";
import { SpaceListHeader } from "./SpaceListHeader";

interface Space {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface SpaceListProps {
  spaces: Space[];
  activeSpaceId?: string;
  className?: string;
  onCreateSpace?: () => void;
}

export const SpaceList: React.FC<SpaceListProps> = ({
  spaces,
  activeSpaceId,
  className = "",
  onCreateSpace,
}) => {
  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <SpaceListHeader onCreateSpace={onCreateSpace} />
        <SearchInput placeholder="Search spaces..." />
      </div>
      <div className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
};
