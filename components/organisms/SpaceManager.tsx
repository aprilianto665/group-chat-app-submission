"use client";

import React, { useState } from "react";
import { SpaceList } from "../molecules/SpaceList";
import { SpaceForm } from "../molecules/SpaceForm";

interface Space {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface SpaceManagerProps {
  spaces: Space[];
  activeSpaceId?: string;
  className?: string;
  onSpaceCreated?: (spaceName: string) => void;
}

export const SpaceManager: React.FC<SpaceManagerProps> = ({
  spaces,
  activeSpaceId,
  className = "",
  onSpaceCreated,
}) => {
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const handleCreateSpace = () => {
    setIsCreatingSpace(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingSpace(false);
  };

  const handleSpaceCreated = (spaceName: string) => {
    if (onSpaceCreated) {
      onSpaceCreated(spaceName);
    }
    setIsCreatingSpace(false);
  };

  if (isCreatingSpace) {
    return (
      <SpaceForm
        onCancel={handleCancelCreate}
        onSubmit={handleSpaceCreated}
        className={className}
      />
    );
  }

  return (
    <SpaceList
      spaces={spaces}
      activeSpaceId={activeSpaceId}
      onCreateSpace={handleCreateSpace}
      className={className}
    />
  );
};
