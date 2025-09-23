"use client";

import React, { memo } from "react";
import { MessageBubble } from "../../atoms/chat/MessageBubble";
import { Avatar } from "../../atoms/Avatar";
import type { Message } from "@/types";

interface MessageItemProps extends Message {
  className?: string;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({
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

export const MessageItem = memo(MessageItemComponent);
