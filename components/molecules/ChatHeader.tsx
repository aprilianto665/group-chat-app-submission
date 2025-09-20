import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Avatar } from "../atoms/Avatar";

interface ChatHeaderProps {
  groupName: string;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  groupName,
  className = "",
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Avatar size="md" className="mr-3">
            {groupName.charAt(0).toUpperCase()}
          </Avatar>
          <Heading level={3} className="text-gray-900">
            {groupName}
          </Heading>
        </div>
        <Button variant="icon" size="sm">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
