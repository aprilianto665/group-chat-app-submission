"use client";

/**
 * NoteBlockRow Component
 *
 * Individual row component for note blocks with:
 * - Drag-and-drop functionality with @dnd-kit
 * - Block type rendering (text, heading, todo)
 * - Context menu with block actions
 * - Auto-resize functionality for textareas
 * - Visual feedback during drag operations
 * - Performance optimization with memoization
 * - Accessibility features
 */

import React, { memo, useEffect, useRef } from "react";
import { DragDotsIcon } from "../../atoms/Icons";
import { TodoBlock } from "./TodoBlock";
import { TextBlock } from "./TextBlock";
import { BlockMenu } from "./BlockMenu";
import type { NoteBlock } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Props interface for NoteBlockRow component
 */
interface NoteBlockRowProps {
  block: NoteBlock;
  isEditing: boolean;
  isDraggingAnyBlock: boolean;
  isActive: boolean;
  setBlockRowRef: (el: HTMLDivElement | null) => void;
  openBlockMenuId: string | null;
  setOpenBlockMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  handleChangeBlock: (
    blockId: string,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleDeleteBlock: (blockId: string) => void;
  handleUpdateBlock: (
    blockId: string,
    updater: (b: NoteBlock) => NoteBlock
  ) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

/**
 * NoteBlockRow Component Implementation
 *
 * Renders an individual note block row with drag-and-drop functionality.
 * Handles different block types and provides context menu for block actions.
 *
 * @param block - The note block data to render
 * @param isEditing - Whether the note is in editing mode
 * @param isDraggingAnyBlock - Whether any block is currently being dragged
 * @param isActive - Whether this block is currently active (being dragged)
 * @param setBlockRowRef - Callback to set the block row ref
 * @param openBlockMenuId - ID of the currently open block menu
 * @param setOpenBlockMenuId - Function to set the open block menu ID
 * @param handleChangeBlock - Handler for block content changes
 * @param handleDeleteBlock - Handler for block deletion
 * @param handleUpdateBlock - Handler for block updates
 * @param blockRefs - Refs for block textarea elements
 */
const NoteBlockRowComponent: React.FC<NoteBlockRowProps> = ({
  block,
  isEditing,
  isDraggingAnyBlock,
  isActive,
  setBlockRowRef,
  openBlockMenuId,
  setOpenBlockMenuId,
  handleChangeBlock,
  handleDeleteBlock,
  handleUpdateBlock,
  blockRefs,
}) => {
  // ===== DRAG AND DROP CONFIGURATION =====

  /**
   * @dnd-kit sortable configuration for drag-and-drop functionality
   * Provides all necessary props for drag operations
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  // ===== REFS =====

  /**
   * Ref for the content container - used for auto-resize functionality
   */
  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  // ===== EVENT HANDLERS =====

  /**
   * Combines @dnd-kit node ref with parent component's block row ref
   * @param el - DOM element reference
   */
  const handleSetNodeRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    setBlockRowRef(el);
  };

  // ===== EFFECTS =====

  /**
   * Auto-resize effect for textarea elements
   * Automatically adjusts textarea height based on content
   */
  useEffect(() => {
    if (!contentContainerRef.current) return;
    const areas = contentContainerRef.current.querySelectorAll(
      "textarea"
    ) as NodeListOf<HTMLTextAreaElement>;
    areas.forEach((el) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [block, isEditing]);

  // ===== COMPUTED VALUES =====

  /**
   * Dynamic styles for drag-and-drop operations
   * Includes transform, transition, opacity, and z-index changes
   */
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 60 : undefined,
  };

  return (
    <div
      ref={handleSetNodeRef}
      style={style}
      className={`group rounded relative pl-4 pr-4 mb-1.5 ${
        isActive ? "invisible" : ""
      }`}
    >
      <div
        className={`absolute left-0 top-0 transition-opacity z-10 ${
          openBlockMenuId === block.id
            ? "opacity-100"
            : isEditing
            ? "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          ref={setActivatorNodeRef}
          className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus:ring-offset-0 cursor-grab active:cursor-grabbing z-20"
          onClick={() =>
            setOpenBlockMenuId((prev) =>
              prev === String(block.id) ? null : String(block.id)
            )
          }
          aria-label="Block actions"
          disabled={!isEditing}
          {...attributes}
          {...listeners}
        >
          <DragDotsIcon className="w-4 h-4" />
        </button>
        <BlockMenu
          isOpen={openBlockMenuId === String(block.id)}
          onClose={() => setOpenBlockMenuId(null)}
          onDelete={() => handleDeleteBlock(String(block.id))}
        />
      </div>

      {block.type === "todo" ? (
        <div
          className={`w-full ${
            isDraggingAnyBlock ? "pointer-events-none" : ""
          }`}
          ref={contentContainerRef}
        >
          <TodoBlock
            block={block}
            isEditing={isEditing}
            onUpdateBlock={(updater) =>
              handleUpdateBlock(String(block.id), updater)
            }
          />
        </div>
      ) : (
        <TextBlock
          block={block}
          isEditing={isEditing}
          onChange={(e) => handleChangeBlock(String(block.id), e)}
          blockRefs={blockRefs}
        />
      )}
    </div>
  );
};

/**
 * Memoized NoteBlockRow component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export const NoteBlockRow = memo(NoteBlockRowComponent);
