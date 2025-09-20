import { MessageBubble } from "../atoms/MessageBubble";

interface MessageItemProps {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  id,
  content,
  timestamp,
  isSent = false,
  senderName,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col mb-4 ${
        isSent ? "items-end" : "items-start"
      } ${className}`}
    >
      {!isSent && senderName && (
        <span className="text-xs text-gray-500 mb-1">{senderName}</span>
      )}
      <MessageBubble
        variant={isSent ? "sent" : "received"}
        timestamp={timestamp}
      >
        {content}
      </MessageBubble>
    </div>
  );
};
