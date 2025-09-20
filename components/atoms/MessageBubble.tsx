import { Heading } from "./Heading";

interface MessageBubbleProps {
  variant?: "sent" | "received";
  children: React.ReactNode;
  timestamp?: string;
  senderName?: string;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  variant = "received",
  children,
  timestamp,
  senderName,
  className = "",
}) => {
  const variantClasses = {
    sent: "bg-blue-500 text-white ml-auto",
    received: "bg-gray-100 text-gray-900 mr-auto",
  };

  const timestampClasses = {
    sent: "text-blue-100",
    received: "text-gray-400",
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          max-w-xs px-4 py-2 rounded-xl relative
          ${variantClasses[variant]}
        `}
      >
        <div className="pr-12">
          {senderName && (
            <Heading level={6} className="text-gray-600">
              {senderName}
            </Heading>
          )}
          {children}
        </div>
        {timestamp && (
          <div
            className={`absolute bottom-1 right-2 text-xs ${timestampClasses[variant]}`}
          >
            {timestamp}
          </div>
        )}
      </div>

      <div
        className={`
          absolute top-0 w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-t-12
          ${
            variant === "sent"
              ? "right-[-8px] border-t-blue-500"
              : "left-[-8px] border-t-gray-100"
          }
        `}
      />
    </div>
  );
};
