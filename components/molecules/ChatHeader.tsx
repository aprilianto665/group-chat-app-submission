import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Avatar } from "../atoms/Avatar";
import { MenuIcon } from "../atoms/Icons";

interface ChatHeaderProps {
  groupName: string;
  groupIcon?: string;
  className?: string;
  onToggleNotes?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  groupName,
  groupIcon,
  className = "",
  onToggleNotes,
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Avatar
            size="md"
            className="mr-3"
            src={groupIcon && groupIcon.length > 0 ? groupIcon : undefined}
          >
            {(!groupIcon || groupIcon.length === 0) &&
              groupName.charAt(0).toUpperCase()}
          </Avatar>
          <Heading level={3} className="text-gray-900">
            {groupName}
          </Heading>
        </div>
        <Button variant="icon" size="sm" onClick={onToggleNotes}>
          <MenuIcon />
        </Button>
      </div>
    </div>
  );
};
