"use client";

import React, { memo, useCallback, useMemo } from "react";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";
import { AttachmentIcon, SendIcon } from "../../atoms/Icons";

interface ChatInputProps {
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend?: () => void;
  disabled?: boolean;
}

const ChatInputComponent: React.FC<ChatInputProps> = ({
  className = "",
  value,
  onChange,
  onSend,
  disabled,
}) => {
  const canSend = useMemo(
    () => !!value && value.trim().length > 0 && !disabled,
    [value, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSend) onSend?.();
      }
    },
    [canSend, onSend]
  );

  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />
        <Button variant="icon" size="md" disabled>
          <AttachmentIcon />
        </Button>
        <Button
          variant="send"
          size="sm"
          className="rounded-full flex-shrink-0"
          disabled={!canSend}
          onClick={onSend}
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
