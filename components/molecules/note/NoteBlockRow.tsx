"use client";

import React, { memo, useEffect, useRef } from "react";
import { DragDotsIcon } from "../../atoms/Icons";
import { TodoBlock } from "./TodoBlock";
import { TextBlock } from "./TextBlock";
import { BlockMenu } from "./BlockMenu";
import type { NoteBlock } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  handleUpdateBlockUI?: (
    blockId: string,
    updater: (b: NoteBlock) => NoteBlock
  ) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

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
  handleUpdateBlockUI,
  blockRefs,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSetNodeRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    setBlockRowRef(el);
  };

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
            setOpenBlockMenuId((prev) => (prev === block.id ? null : block.id))
          }
          aria-label="Block actions"
          disabled={!isEditing}
          {...attributes}
          {...listeners}
        >
          <DragDotsIcon className="w-4 h-4" />
        </button>
        <BlockMenu
          isOpen={openBlockMenuId === block.id}
          onClose={() => setOpenBlockMenuId(null)}
          onDelete={() => handleDeleteBlock(block.id)}
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
            onUpdateBlock={(updater) => handleUpdateBlock(block.id, updater)}
            onUpdateBlockUI={
              handleUpdateBlockUI
                ? (updater) => handleUpdateBlockUI(block.id, updater)
                : undefined
            }
          />
        </div>
      ) : (
        <TextBlock
          block={block}
          isEditing={isEditing}
          onChange={(e) => handleChangeBlock(block.id, e)}
          blockRefs={blockRefs}
        />
      )}
    </div>
  );
};

export const NoteBlockRow = memo(NoteBlockRowComponent);
