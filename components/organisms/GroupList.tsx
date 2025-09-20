import React from "react";
import { GroupItem } from "../molecules/GroupItem";
import { SearchInput } from "../molecules/SearchInput";
import { Heading } from "../atoms/Heading";

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
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  activeGroupId,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <Heading level={3} className="mb-4 text-[#4D46E4]">
          Binder
        </Heading>
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
