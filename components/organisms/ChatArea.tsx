import { MessageList } from "./MessageList";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatInput } from "../molecules/ChatInput";
import type { Message } from "@/types";

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
