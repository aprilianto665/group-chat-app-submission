"use client";

/**
 * ProfileDetail Component
 *
 * User profile display component with:
 * - User avatar with fallback to initials
 * - User name and username display
 * - Back navigation functionality
 * - Logout functionality with NextAuth integration
 * - Clean, centered layout design
 * - Responsive design with proper spacing
 * - Accessibility features with proper labels
 * - Professional styling with consistent theming
 */

import React from "react";

import { Avatar } from "../../atoms/Avatar";
import { Heading } from "../../atoms/Heading";
import { Button } from "../../atoms/Button";
import { BackArrowIcon, LogoutIcon } from "../../atoms/Icons";
import { signOut } from "next-auth/react";

/**
 * Props interface for ProfileDetail component
 */
interface ProfileDetailProps {
  avatar?: string;
  name: string;
  username: string;
  onBack?: () => void;
}

/**
 * ProfileDetail Component Implementation
 *
 * Renders user profile information with avatar, name, username, and logout functionality.
 * Provides back navigation and integrates with NextAuth for authentication.
 *
 * @param avatar - Optional user avatar image URL
 * @param name - User's display name
 * @param username - User's username (without @ symbol)
 * @param onBack - Optional callback for back navigation
 */
export const ProfileDetail: React.FC<ProfileDetailProps> = ({
  avatar,
  name,
  username,
  onBack,
}) => {
  // ===== EVENT HANDLERS =====

  /**
   * Handles user logout functionality
   * Signs out the user and redirects to login page
   */
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };
  return (
    <div className="p-4">
      <div className="mb-4">
        {onBack && (
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 !p-0"
          >
            <BackArrowIcon className="flex-shrink-0" />
            Space List
          </Button>
        )}
      </div>

      <div>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <Avatar src={avatar} size="lg" className="w-24 h-24">
              {!avatar && name.charAt(0).toUpperCase()}
            </Avatar>
          </div>

          <div className="space-y-2">
            <Heading level={3} className="text-gray-900">
              {name}
            </Heading>
            <p className="text-gray-500 text-lg">@{username}</p>
          </div>
        </div>

        <div className="mt-8">
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="w-full rounded-full bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 border-red-500 flex items-center justify-center gap-2"
          >
            <LogoutIcon />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
