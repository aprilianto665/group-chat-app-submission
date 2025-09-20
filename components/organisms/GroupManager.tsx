"use client";

import React, { useState } from "react";
import { GroupList } from "../molecules/GroupList";
import { GroupForm } from "../molecules/GroupForm";

interface Group {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface GroupManagerProps {
  groups: Group[];
  activeGroupId?: string;
  className?: string;
  onGroupCreated?: (groupName: string) => void;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  activeGroupId,
  className = "",
  onGroupCreated,
}) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const handleCreateGroup = () => {
    setIsCreatingGroup(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingGroup(false);
  };

  const handleGroupCreated = (groupName: string) => {
    if (onGroupCreated) {
      onGroupCreated(groupName);
    }
    setIsCreatingGroup(false);
  };

  if (isCreatingGroup) {
    return (
      <GroupForm
        onCancel={handleCancelCreate}
        onSubmit={handleGroupCreated}
        className={className}
      />
    );
  }

  return (
    <GroupList
      groups={groups}
      activeGroupId={activeGroupId}
      onCreateGroup={handleCreateGroup}
      className={className}
    />
  );
};
