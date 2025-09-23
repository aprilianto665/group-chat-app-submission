"use client";

import React, { memo } from "react";
import { KebabIcon, PencilIcon, TrashIcon } from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { AutoResizeTextarea } from "../../atoms/AutoResizeTextarea";

interface NoteHeaderProps {
  title: string;
  isEditing: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEdit: () => void;
  onDelete: () => void;
  titleRef: React.RefObject<HTMLTextAreaElement>;
}

const NoteHeaderComponent: React.FC<NoteHeaderProps> = ({
  title,
  isEditing,
  onTitleChange,
  onEdit,
  onDelete,
  titleRef,
}) => {
  const [kebabOpen, setKebabOpen] = React.useState(false);

  return (
    <div className="flex items-start justify-between mb-2">
      <AutoResizeTextarea
        ref={titleRef}
        className="py-1 text-2xl font-bold leading-tight text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full disabled:opacity-70"
        placeholder="Untitled"
        rows={1}
        value={title}
        onChange={isEditing ? onTitleChange : () => {}}
        disabled={!isEditing}
      />
      <div className="ml-2 relative">
        <div className="relative">
          <Button
            variant="icon"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setKebabOpen((v) => !v)}
            aria-label="More actions"
          >
            <KebabIcon className="w-5 h-5" />
          </Button>
          {kebabOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
              {!isEditing && (
                <Button
                  variant="text"
                  size="sm"
                  className="w-full flex items-center gap-2 justify-start text-gray-700 hover:bg-gray-50 px-2 py-2"
                  onClick={() => {
                    setKebabOpen(false);
                    onEdit();
                  }}
                >
                  <PencilIcon />
                  Edit note
                </Button>
              )}
              <Button
                variant="text"
                size="sm"
                className="w-full flex items-center gap-2 justify-start text-gray-700 hover:bg-gray-50 px-2 py-2"
                onClick={() => {
                  setKebabOpen(false);
                  onDelete();
                }}
              >
                <TrashIcon />
                Delete note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NoteHeader = memo(NoteHeaderComponent);
