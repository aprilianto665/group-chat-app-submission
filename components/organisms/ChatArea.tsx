import React, { memo, useCallback, useState } from "react";
import { MessageList } from "./MessageList";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatInput } from "../molecules/ChatInput";
import type { Message } from "@/types";

interface ChatAreaProps {
  groupName?: string;
  messages: Message[];
  className?: string;
  onSendMessage?: (content: string) => void;
}

const ChatAreaComponent: React.FC<ChatAreaProps> = ({
  groupName,
  messages,
  className = "",
  onSendMessage,
}) => {
  const [draft, setDraft] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setDraft("");
  }, [draft, onSendMessage]);
  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {groupName && <ChatHeader groupName={groupName} />}
      <MessageList messages={messages} />
      <ChatInput
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onSend={handleSend}
      />
    </div>
  );
};

export const ChatArea = memo(ChatAreaComponent);
