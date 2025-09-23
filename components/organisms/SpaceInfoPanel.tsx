import React from "react";
import { Avatar } from "../atoms/Avatar";
import { Heading } from "../atoms/Heading";
import { CloseIcon } from "../atoms/Icons";

interface SpaceInfoPanelProps {
  name: string;
  icon?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
}

const SpaceInfoPanelComponent: React.FC<SpaceInfoPanelProps> = ({
  name,
  icon,
  description,
  className = "",
  onClose,
}) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center mb-6 gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close group info"
            className="text-gray-600 hover:text-gray-800"
            title="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        )}
        <Heading level={6} className="text-gray-900">
          Manage your space
        </Heading>
      </div>
      <div className="flex flex-col items-center mb-4">
        <Avatar
          size="xxl"
          className="mb-3 shrink-0"
          src={icon && icon.length > 0 ? icon : undefined}
        >
          {(!icon || icon.length === 0) && name.charAt(0).toUpperCase()}
        </Avatar>
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          {name}
        </h2>
        <p className="text-gray-600 mt-1 max-w-prose whitespace-pre-line text-center">
          {description && description.trim().length > 0
            ? description
            : "No description"}
        </p>
      </div>
    </div>
  );
};

export const SpaceInfoPanel = SpaceInfoPanelComponent;
