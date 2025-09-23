"use client";

import React, { memo } from "react";
import { DragDotsIcon, TrashIcon } from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { AutoResizeTextarea } from "../../atoms/AutoResizeTextarea";
import type { NoteBlockItem } from "@/types";

interface TodoItemProps {
  item: NoteBlockItem;
  isEditing: boolean;
  onUpdateItem: (updater: (i: NoteBlockItem) => NoteBlockItem) => void;
  onDeleteItem: () => void;
  dragProps?: {
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
    setNodeRef: (node: HTMLElement | null) => void;
    setActivatorNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
  };
}

const TodoItemComponent: React.FC<TodoItemProps> = ({
  item,
  isEditing,
  onUpdateItem,
  onDeleteItem,
  dragProps,
}) => {
  return (
    <div
      ref={dragProps?.setNodeRef}
      style={dragProps?.style}
      className="flex items-start gap-2"
    >
      {dragProps && (
        <button
          ref={dragProps.setActivatorNodeRef}
          className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 focus:outline-none cursor-grab active:cursor-grabbing"
          aria-label="Drag item"
          disabled={!isEditing}
          {...dragProps.attributes}
          {...dragProps.listeners}
        >
          <DragDotsIcon className="w-4 h-4" />
        </button>
      )}
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900"
        checked={item.done}
        onChange={(e) =>
          onUpdateItem((i) => ({ ...i, done: e.target.checked }))
        }
      />
      <div className="flex-1 min-w-0">
        <AutoResizeTextarea
          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 whitespace-pre-wrap break-words"
          placeholder="To-do item"
          rows={1}
          value={item.text}
          onChange={(e) => {
            onUpdateItem((i) => ({ ...i, text: e.target.value }));
          }}
          disabled={!isEditing}
        />
        {item.description && (
          <div className="text-xs text-gray-500 whitespace-pre-wrap break-words mt-0.5">
            {item.description}
          </div>
        )}
      </div>
      {isEditing && (
        <Button
          variant="icon"
          size="sm"
          className="text-gray-400 hover:text-red-600"
          aria-label="Delete to-do item"
          onClick={onDeleteItem}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export const TodoItem = memo(TodoItemComponent);
