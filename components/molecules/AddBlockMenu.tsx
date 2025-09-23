import React, { memo, useState } from "react";
import { Button } from "../atoms/Button";
import { TextBlockIcon, TodoIcon, HeadingIcon } from "../atoms/Icons";
import type { NoteBlock } from "@/types";

interface AddBlockMenuProps {
  onAdd: (type: NoteBlock["type"]) => void;
}

const AddBlockMenuComponent: React.FC<AddBlockMenuProps> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative pt-1">
      <div className="flex items-center gap-2">
        <Button
          variant="text"
          size="sm"
          className="inline-flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
          onClick={() => setOpen((v) => !v)}
        >
          <TextBlockIcon className="w-4 h-4" />
          Text
        </Button>
        <Button
          variant="text"
          size="sm"
          className="inline-flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
          onClick={() => onAdd("todo")}
        >
          <TodoIcon className="w-4 h-4" />
          To-do
        </Button>
      </div>
      {open && (
        <div className="absolute left-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-md z-30 p-1 min-w-[10rem]">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            onClick={() => {
              onAdd("text");
              setOpen(false);
            }}
          >
            <TextBlockIcon className="w-4 h-4" />
            Paragraph
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            onClick={() => {
              onAdd("heading");
              setOpen(false);
            }}
          >
            <HeadingIcon className="w-4 h-4" />
            Heading
          </button>
        </div>
      )}
    </div>
  );
};

export const AddBlockMenu = memo(AddBlockMenuComponent);
