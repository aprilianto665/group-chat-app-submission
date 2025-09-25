"use client";

/**
 * ChatInput Component
 *
 * Input component for sending chat messages with:
 * - Text input with placeholder
 * - Send button with icon
 * - Enter key support for sending messages
 * - Disabled state handling
 * - Performance optimization with memoization
 * - Keyboard accessibility
 * - Responsive design
 */

import React, { memo, useCallback, useMemo } from "react";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";
import { SendIcon } from "../../atoms/Icons";

/**
 * Props interface for ChatInput component
 */
interface ChatInputProps {
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend?: () => void;
  disabled?: boolean;
}

/**
 * ChatInput Component Implementation
 *
 * Renders a chat input with send button and keyboard support.
 * Handles message sending via Enter key or button click.
 *
 * @param className - Additional CSS classes for styling
 * @param value - Controlled input value
 * @param onChange - Change event handler for input
 * @param onSend - Callback function when send button is clicked
 * @param disabled - Whether the input is disabled
 */
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
