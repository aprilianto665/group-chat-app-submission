"use client";

/**
 * MessageList Component
 *
 * Displays chat messages with advanced features:
 * - Message grouping by date with visual separators
 * - Activity message rendering with icons
 * - Auto-scroll to latest messages
 * - Empty state handling
 * - Performance optimization with memoization
 * - Message type differentiation (text vs activity)
 */

import React, { memo, useEffect, useMemo, useRef } from "react";
import { NoteIcon, UserIcon, PencilIcon } from "../../atoms/Icons";
import { MessageItem } from "../../molecules/chat/MessageItem";
import { EmptyState } from "../../atoms/EmptyState";
import { formatDate, formatTime, groupMessagesByDate } from "@/utils/dateUtils";
import { useProfileStore } from "@/stores/profileStore";
import type { Message } from "@/types";

/**
 * Props interface for MessageList component
 */
interface MessageListProps {
  messages: Message[];
  className?: string;
}

/**
 * MessageList Component Implementation
 *
 * Renders a list of messages with date grouping and auto-scroll.
 * Handles both regular messages and activity messages with different styling.
 *
 * @param messages - Array of messages to display
 * @param className - Additional CSS classes for styling
 */
const MessageListComponent: React.FC<MessageListProps> = ({
  messages,
  className = "",
}) => {
  const { user } = useProfileStore();
  const listRef = useRef<HTMLDivElement | null>(null);
  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );
  const sortedDates = useMemo(
    () =>
      Object.keys(groupedMessages).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      ),
    [groupedMessages]
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  return (
    <div
      ref={listRef}
      className={`flex-1 overflow-y-auto p-4 px-5 space-y-1 ${className}`}
    >
      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Start a conversation by sending your first message!"
          className="h-full"
        />
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4 px-2 select-none">
              <div className="flex-1 h-px bg-gray-300/60 rounded-full" />
              <div className="text-gray-600 text-xs">{formatDate(date)}</div>
              <div className="flex-1 h-px bg-gray-300/60 rounded-full" />
            </div>
            {groupedMessages[date].map((message) =>
              message.type === "activity" ? (
                <div
                  key={message.id}
                  className="flex items-center justify-center my-2"
                >
                  <div className="flex items-center gap-1.5 bg-[#efeaff] text-[#6b61c4] text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {/(joined the space|joined\s+the\s+space|left the space|left\s+the\s+space)/i.test(
                      message.content || ""
                    ) ? (
                      <UserIcon className="w-4 h-4" />
                    ) : /updated the space info/i.test(
                        message.content || ""
                      ) ? (
                      <PencilIcon className="w-4 h-4" />
                    ) : (
                      <NoteIcon className="w-4 h-4" />
                    )}
                    <span
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                </div>
              ) : (
                <MessageItem
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  timestamp={formatTime(message.timestamp)}
                  isSent={
                    message.username
                      ? message.username === user?.username
                      : !!message.isSent
                  }
                  senderName={message.senderName}
                />
              )
            )}
          </div>
        ))
      )}
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
