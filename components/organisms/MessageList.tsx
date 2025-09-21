import { MessageItem } from "../molecules/MessageItem";
import { formatDate, formatTime, groupMessagesByDate } from "@/utils/dateUtils";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  className = "",
}) => {
  const groupedMessages = groupMessagesByDate(messages);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className={`flex-1 overflow-y-auto p-4 px-5 space-y-1 ${className}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDate(date)}
              </div>
            </div>
            {groupedMessages[date].map((message) => (
              <MessageItem
                key={message.id}
                id={message.id}
                content={message.content}
                timestamp={formatTime(message.timestamp)}
                isSent={message.isSent}
                senderName={message.senderName}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
};
