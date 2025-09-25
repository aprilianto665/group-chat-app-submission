"use client";

/**
 * MessageItem Component
 *
 * Individual message component for chat interface with:
 * - Message bubble with content and timestamp
 * - Avatar display for received messages
 * - Sent vs received message styling
 * - Sender name display
 * - Performance optimization with memoization
 */

import React, { memo } from "react";
import { MessageBubble } from "../../atoms/chat/MessageBubble";
import { Avatar } from "../../atoms/Avatar";
import type { Message } from "@/types";

/**
 * Props interface for MessageItem component
 * Extends Message type with additional className prop
 */
interface MessageItemProps extends Message {
  className?: string;
}

/**
 * MessageItem Component Implementation
 *
 * Renders an individual message with appropriate styling and layout.
 * Handles both sent and received messages with different layouts.
 *
 * @param content - Message content text
 * @param timestamp - Message timestamp
 * @param isSent - Whether this is a sent message (default: false)
 * @param senderName - Name of the message sender
 * @param className - Additional CSS classes for styling
 */
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
