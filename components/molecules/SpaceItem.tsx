import React, { memo, useCallback } from "react";
import { Avatar } from "../atoms/Avatar";

interface SpaceItemProps {
  name: string;
  lastMessage?: string;
  lastMessageSender?: string;
  unreadCount?: number;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

const SpaceItemComponent: React.FC<SpaceItemProps> = ({
  name,
  lastMessage,
  lastMessageSender,
  unreadCount = 0,
  isActive = false,
  className = "",
  onClick,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        onClick?.();
      }
    },
    [onClick]
  );
  return (
    <div
      className={`
        flex items-center p-3
        ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""}
        ${className}
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <Avatar size="md" className="mr-3">
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-500 truncate mt-1">
            {lastMessageSender
              ? `${lastMessageSender}: ${lastMessage}`
              : lastMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export const SpaceItem = memo(SpaceItemComponent);
