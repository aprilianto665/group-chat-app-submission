"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import { ChevronDownIcon, PlusIcon } from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { AutoResizeTextarea } from "../../atoms/AutoResizeTextarea";
import { ProgressBar } from "../../atoms/ProgressBar";
import { TodoItem } from "./TodoItem";
import type { NoteBlock } from "@/types";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

interface TodoBlockProps {
  block: NoteBlock;
  isEditing: boolean;
  onUpdateBlock: (updater: (b: NoteBlock) => NoteBlock) => void;
  onUpdateBlockUI?: (updater: (b: NoteBlock) => NoteBlock) => void;
}

const TodoBlockComponent: React.FC<TodoBlockProps> = ({
  block,
  isEditing,
  onUpdateBlock,
  onUpdateBlockUI,
}) => {
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");

  const updateUIOnly = onUpdateBlockUI ?? onUpdateBlock;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const items = useMemo(() => block.items ?? [], [block.items]);
  const completedItems = useMemo(
    () => items.filter((item) => item.done).length,
    [items]
  );

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const itemSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleAddTodo = useCallback(() => {
    if (newTodoText.trim()) {
      onUpdateBlock((b) => ({
        ...b,
        items: [
          ...items,
          {
            id: `todo_item_${Date.now()}`,
            text: newTodoText.trim(),
            done: false,
            description: newTodoDescription.trim() || undefined,
          },
        ],
      }));
      setNewTodoText("");
      setNewTodoDescription("");
      setShowAddTodoModal(false);
    }
  }, [newTodoText, newTodoDescription, items, onUpdateBlock]);

  const handleTodoDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex);
      onUpdateBlock((b) => ({
        ...b,
        items: newItems,
      }));
    },
    [items, onUpdateBlock]
  );

  return (
    <div className="w-full rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-start gap-2">
        <AutoResizeTextarea
          className="flex-1 w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base font-semibold text-gray-900 placeholder-gray-500 whitespace-pre-wrap break-words"
          placeholder="To-do list title"
          rows={1}
          value={block.todoTitle ?? ""}
          onChange={(e) => {
            onUpdateBlock((b) => ({
              ...b,
              todoTitle: e.target.value,
            }));
          }}
          disabled={!isEditing}
        />
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="mt-0.5 text-gray-400 hover:text-gray-600 p-1"
          aria-label={isCollapsed ? "Expand list" : "Collapse list"}
        >
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-2">
        <ProgressBar completed={completedItems} total={items.length} />
      </div>

      {!isCollapsed && (
        <div className="mt-2 space-y-2">
          <DndContext
            sensors={itemSensors}
            collisionDetection={closestCorners}
            onDragEnd={handleTodoDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <TodoItem
                  key={item.id}
                  item={item}
                  isEditing={isEditing}
                  onUpdateItem={(updater) =>
                    onUpdateBlock((b) => ({
                      ...b,
                      items: items.map((x) =>
                        x.id === item.id ? updater(x) : x
                      ),
                    }))
                  }
                  onDeleteItem={() =>
                    onUpdateBlock((b) => ({
                      ...b,
                      items: items.filter((x) => x.id !== item.id),
                    }))
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {!isCollapsed && (
        <div className="relative">
          <Button
            variant="text"
            size="sm"
            className="inline-flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
            onClick={() => setShowAddTodoModal(!showAddTodoModal)}
          >
            <PlusIcon className="w-4 h-4" />
            Add to-do item
          </Button>
          {showAddTodoModal && (
            <div className="mt-2 w-full">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Type your first to-do here"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="w-full bg-transparent outline-none focus:outline-none px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newTodoDescription}
                  onChange={(e) => setNewTodoDescription(e.target.value)}
                  className="w-full bg-transparent outline-none focus:outline-none px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400"
                />
                <div className="flex justify-end items-center gap-2">
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => {
                      setNewTodoText("");
                      setNewTodoDescription("");
                      setShowAddTodoModal(false);
                    }}
                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <Button
                    variant="text"
                    size="sm"
                    onClick={handleAddTodo}
                    disabled={!newTodoText.trim()}
                    className="px-2 py-1 text-gray-700 hover:bg-gray-50"
                  >
                    Add to the list
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TodoBlock = memo(TodoBlockComponent);
