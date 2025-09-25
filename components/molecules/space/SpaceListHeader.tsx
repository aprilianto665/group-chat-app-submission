/**
 * SpaceListHeader Component
 *
 * Header component for the space list with:
 * - Application branding (Binder logo/title)
 * - Create space button with icon
 * - Consistent styling and layout
 * - Optional create space functionality
 */

import React from "react";
import { Heading } from "../../atoms/Heading";
import { Button } from "../../atoms/Button";
import { PlusIcon } from "../../atoms/Icons";

/**
 * Props interface for SpaceListHeader component
 */
interface SpaceListHeaderProps {
  onCreateSpace?: () => void;
  className?: string;
}

/**
 * SpaceListHeader Component Implementation
 *
 * Renders the header for the space list with branding and create button.
 *
 * @param onCreateSpace - Optional callback for creating a new space
 * @param className - Additional CSS classes for styling
 */
export const SpaceListHeader: React.FC<SpaceListHeaderProps> = ({
  onCreateSpace,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Heading level={3} className="text-[#4D46E4]">
        Binder
      </Heading>
      {onCreateSpace && (
        <Button
          variant="icon"
          size="sm"
          onClick={onCreateSpace}
          className="text-[#4F45E4] hover:text-[#4339D1]"
          title="Create a space"
        >
          <PlusIcon size={20} />
        </Button>
      )}
    </div>
  );
};
