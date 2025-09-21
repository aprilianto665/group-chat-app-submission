import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { AttachmentIcon, SendIcon } from "../atoms/Icons";

interface ChatInputProps {
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ className = "" }) => {
  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      <div className="flex items-center space-x-2">
        <Input type="text" placeholder="Type a message..." className="flex-1" />
        <Button variant="icon" size="md" disabled>
          <AttachmentIcon />
        </Button>
        <Button
          variant="send"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  );
};
