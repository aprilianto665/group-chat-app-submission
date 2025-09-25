"use client";

/**
 * SpaceManager Component - Main Space Sidebar Controller
 *
 * Primary sidebar component managing space navigation, creation, and user profile.
 * Features real-time search filtering, view state management, and global event handling.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SpaceList } from "../../molecules/space/SpaceList";
import { SpaceForm } from "../../molecules/space/SpaceForm";
import { ProfileDetail } from "../../molecules/profile/ProfileDetail";
import { SpaceListHeader } from "../../molecules/space/SpaceListHeader";
import { SearchInput } from "../../molecules/SearchInput";
import { useProfileStore } from "@/stores/profileStore";
import type { Space, SpaceWithNotes } from "@/types";

/**
 * Props interface for SpaceManager component
 */
interface SpaceManagerProps {
  spaces: Space[];
  activeSpaceId?: string;
  className?: string;
  onSpaceCreated?: (space: SpaceWithNotes) => void;
  onSelectSpace?: (spaceId: string) => void;
}

/**
 * SpaceManager Component Implementation
 *
 * Renders the main sidebar with space management functionality.
 * Handles view state transitions and coordinates between different UI sections.
 *
 * @param spaces - Array of spaces to display and manage
 * @param activeSpaceId - Currently selected space ID
 * @param className - Additional CSS classes
 * @param onSpaceCreated - Handler for when a new space is created
 * @param onSelectSpace - Handler for space selection
 */
export const SpaceManager: React.FC<SpaceManagerProps> = ({
  spaces,
  activeSpaceId,
  className = "",
  onSpaceCreated,
  onSelectSpace,
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Controls visibility of space creation form
   * When true, shows SpaceForm instead of SpaceList
   */
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  /**
   * Search query for filtering spaces
   * Used for real-time space filtering
   */
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Profile store state and methods
   * Manages current view and user profile information
   */
  const { currentView, user, showProfile, hideProfile } = useProfileStore();

  // ===== COMPUTED VALUES =====

  /**
   * Filtered spaces based on search query
   * Performs case-insensitive name matching
   */
  const filteredSpaces = useMemo(
    () =>
      spaces.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [spaces, searchQuery]
  );

  // ===== EVENT HANDLERS =====

  /**
   * Initiates space creation mode
   * Shows the space creation form
   */
  const handleCreateSpace = useCallback(() => {
    setIsCreatingSpace(true);
  }, []);

  /**
   * Cancels space creation and returns to space list
   * Hides the space creation form
   */
  const handleCancelCreate = useCallback(() => {
    setIsCreatingSpace(false);
  }, []);

  /**
   * Handles successful space creation
   * Calls parent callback and exits creation mode
   * @param space - The newly created space with notes
   */
  const handleSpaceCreated = useCallback(
    (space: SpaceWithNotes) => {
      if (onSpaceCreated) {
        onSpaceCreated(space);
      }
      setIsCreatingSpace(false);
    },
    [onSpaceCreated]
  );

  /**
   * Returns to spaces view from profile
   * Hides profile and shows space list
   */
  const handleBackToSpaces = useCallback(() => {
    hideProfile();
  }, [hideProfile]);

  // ===== EFFECTS =====

  /**
   * Sets up global event listener for profile trigger
   * Handles external requests to show user profile
   * Automatically cancels space creation when profile is triggered
   */
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
            onCreated={handleSpaceCreated}
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
