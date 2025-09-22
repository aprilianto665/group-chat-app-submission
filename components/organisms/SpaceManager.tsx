"use client";

import React, { useState, useEffect } from "react";
import { SpaceList } from "../molecules/SpaceList";
import { SpaceForm } from "../molecules/SpaceForm";
import { ProfileDetail } from "../molecules/ProfileDetail";
import { SpaceListHeader } from "../molecules/SpaceListHeader";
import { SearchInput } from "../molecules/SearchInput";
import { useProfileStore } from "@/stores/profileStore";
import type { Space } from "@/types";

interface SpaceManagerProps {
  spaces: Space[];
  activeSpaceId?: string;
  className?: string;
  onSpaceCreated?: (spaceName: string) => void;
  onSelectSpace?: (spaceId: string) => void;
}

export const SpaceManager: React.FC<SpaceManagerProps> = ({
  spaces,
  activeSpaceId,
  className = "",
  onSpaceCreated,
  onSelectSpace,
}) => {
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentView, user, showProfile, hideProfile } = useProfileStore();

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

  const handleBackToSpaces = () => {
    hideProfile();
  };

  useEffect(() => {
    const handleProfileTrigger = () => {
      setIsCreatingSpace(false);
      showProfile();
    };

    window.addEventListener("profileTrigger", handleProfileTrigger);

    return () => {
      window.removeEventListener("profileTrigger", handleProfileTrigger);
    };
  }, [showProfile]);

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <SpaceListHeader
          onCreateSpace={
            !isCreatingSpace && currentView !== "profile"
              ? handleCreateSpace
              : undefined
          }
        />
        {!isCreatingSpace && currentView !== "profile" && (
          <SearchInput
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {currentView === "profile" && user ? (
          <ProfileDetail
            avatar={user.avatar}
            name={user.name}
            username={user.username}
            onBack={handleBackToSpaces}
          />
        ) : isCreatingSpace ? (
          <SpaceForm
            onCancel={handleCancelCreate}
            onSubmit={handleSpaceCreated}
          />
        ) : (
          <SpaceList
            spaces={spaces.filter((s) =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            activeSpaceId={activeSpaceId}
            onSelectSpace={onSelectSpace}
          />
        )}
      </div>
    </div>
  );
};
