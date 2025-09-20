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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
