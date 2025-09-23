"use client";

import React, { memo } from "react";
import { AutoResizeTextarea } from "../../atoms/AutoResizeTextarea";
import type { NoteBlock } from "@/types";

interface TextBlockProps {
  block: NoteBlock;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}

const TextBlockComponent: React.FC<TextBlockProps> = ({
  block,
  isEditing,
  onChange,
  blockRefs,
}) => {
  return (
    <AutoResizeTextarea
      ref={(el) => {
        blockRefs.current[block.id] = el;
      }}
      className={`w-full outline-none placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-70 ${
        block.type === "heading"
          ? "text-base font-semibold text-gray-900"
          : "text-sm text-gray-900"
      }`}
      rows={1}
      value={block.content}
      onChange={onChange}
      placeholder={isEditing ? "Type here..." : ""}
      disabled={!isEditing}
    />
  );
};

export const TextBlock = memo(TextBlockComponent);
