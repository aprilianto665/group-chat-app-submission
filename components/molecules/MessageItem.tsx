import { MessageBubble } from "../atoms/MessageBubble";
import { Avatar } from "../atoms/Avatar";

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
      className={`flex mb-4 ${
        isSent ? "items-end justify-end" : "items-start"
      } ${className}`}
    >
      {!isSent && (
        <Avatar
          src="/avatar_default.jpg"
          alt={senderName || "User"}
          size="sm"
          className="mr-2 flex-shrink-0"
        />
      )}
      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
        <MessageBubble
          variant={isSent ? "sent" : "received"}
          timestamp={timestamp}
          senderName={!isSent ? senderName : undefined}
        >
          {content}
        </MessageBubble>
      </div>
    </div>
  );
};
