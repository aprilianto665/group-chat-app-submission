import React from "react";
import { MessageItem } from "../molecules/MessageItem";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
}

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  className = "",
}) => {
  return (
    <div className={`flex-1 overflow-y-auto p-4 px-5 space-y-1 ${className}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            id={message.id}
            content={message.content}
            timestamp={message.timestamp}
            isSent={message.isSent}
            senderName={message.senderName}
          />
        ))
      )}
    </div>
  );
};
