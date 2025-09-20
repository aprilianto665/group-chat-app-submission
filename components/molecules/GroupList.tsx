import React from "react";
import { GroupItem } from "./GroupItem";
import { SearchInput } from "./SearchInput";
import { GroupListHeader } from "./GroupListHeader";

interface Group {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface GroupListProps {
  groups: Group[];
  activeGroupId?: string;
  className?: string;
  onCreateGroup?: () => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  activeGroupId,
  className = "",
  onCreateGroup,
}) => {
  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <GroupListHeader onCreateGroup={onCreateGroup} />
        <SearchInput placeholder="Search groups..." />
      </div>
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <GroupItem
            key={group.id}
            id={group.id}
            name={group.name}
            lastMessage={group.lastMessage}
            unreadCount={group.unreadCount}
            isActive={activeGroupId === group.id}
          />
        ))}
      </div>
    </div>
  );
};
