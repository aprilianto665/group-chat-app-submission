"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SpaceList } from "../../molecules/space/SpaceList";
import { SpaceForm } from "../../molecules/space/SpaceForm";
import { ProfileDetail } from "../../molecules/profile/ProfileDetail";
import { SpaceListHeader } from "../../molecules/space/SpaceListHeader";
import { SearchInput } from "../../molecules/SearchInput";
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

  const filteredSpaces = useMemo(
    () =>
      spaces.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [spaces, searchQuery]
  );

  const handleCreateSpace = useCallback(() => {
    setIsCreatingSpace(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreatingSpace(false);
  }, []);

  const handleSpaceCreated = useCallback(
    (spaceName: string) => {
      if (onSpaceCreated) {
        onSpaceCreated(spaceName);
      }
      setIsCreatingSpace(false);
    },
    [onSpaceCreated]
  );

  const handleBackToSpaces = useCallback(() => {
    hideProfile();
  }, [hideProfile]);

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
            spaces={filteredSpaces}
            activeSpaceId={activeSpaceId}
            onSelectSpace={onSelectSpace}
          />
        )}
      </div>
    </div>
  );
};
