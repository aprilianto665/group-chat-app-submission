import { Avatar } from "../atoms/Avatar";

interface SpaceItemProps {
  name: string;
  lastMessage?: string;
  unreadCount?: number;
  isActive?: boolean;
  className?: string;
}

export const SpaceItem: React.FC<SpaceItemProps> = ({
  name,
  lastMessage,
  unreadCount = 0,
  isActive = false,
  className = "",
}) => {
  return (
    <div
      className={`
        flex items-center p-3
        ${isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""}
        ${className}
      `}
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
          <p className="text-xs text-gray-500 truncate mt-1">{lastMessage}</p>
        )}
      </div>
    </div>
  );
};
