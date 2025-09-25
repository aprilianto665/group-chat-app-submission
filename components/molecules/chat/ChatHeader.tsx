"use client";

/**
 * ChatHeader Component
 *
 * Header component for chat interface with:
 * - Space information display (name and icon)
 * - Space avatar with fallback to first letter
 * - Toggle notes functionality
 * - Space info access button
 * - Clean, professional layout
 * - Accessibility features with titles
 * - Responsive design
 */

import { Button } from "../../atoms/Button";
import { Heading } from "../../atoms/Heading";
import { Avatar } from "../../atoms/Avatar";
import { NoteIcon } from "../../atoms/Icons";

/**
 * Props interface for ChatHeader component
 */
interface ChatHeaderProps {
  spaceName: string;
  spaceIcon?: string;
  className?: string;
  onToggleNotes?: () => void;
  onOpenSpaceInfo?: () => void;
}

/**
 * ChatHeader Component Implementation
 *
 * Renders the header for chat interface with space information and controls.
 * Provides access to space info and notes toggle functionality.
 *
 * @param spaceName - Name of the current space
 * @param spaceIcon - Optional icon URL for the space
 * @param className - Additional CSS classes for styling
 * @param onToggleNotes - Callback function for toggling notes panel
 * @param onOpenSpaceInfo - Callback function for opening space information
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  spaceName,
  spaceIcon,
  className = "",
  onToggleNotes,
  onOpenSpaceInfo,
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-3 focus:outline-none"
            onClick={onOpenSpaceInfo}
            title="Space info"
          >
            <Avatar
              size="md"
              src={spaceIcon && spaceIcon.length > 0 ? spaceIcon : undefined}
            >
              {(!spaceIcon || spaceIcon.length === 0) &&
                spaceName.charAt(0).toUpperCase()}
            </Avatar>
          </button>
          <Heading level={3} className="text-gray-900">
            {spaceName}
          </Heading>
        </div>
        <Button
          variant="icon"
          size="sm"
          onClick={onToggleNotes}
          title="Toggle notes"
        >
          <NoteIcon className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};
