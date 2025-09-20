import { MessageList } from "./MessageList";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatInput } from "../molecules/ChatInput";

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
      {groupName && <ChatHeader groupName={groupName} />}
      <MessageList messages={messages} />
      <ChatInput />
    </div>
  );
};
