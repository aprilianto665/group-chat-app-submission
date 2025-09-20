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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toDateString();
      if (!grouped[messageDate]) {
        grouped[messageDate] = [];
      }
      grouped[messageDate].push(message);
    });

    return grouped;
  };

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
