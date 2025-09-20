import { MessageList } from "./MessageList";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Avatar } from "../atoms/Avatar";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
}

interface ChatAreaProps {
  groupName?: string;
  messages: Message[];
  className?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  groupName,
  messages,
  className = "",
}) => {
  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {groupName && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
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
      )}

      <MessageList messages={messages} />

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button variant="icon" size="md" disabled>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </Button>
          <Button variant="send" size="md" disabled>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
