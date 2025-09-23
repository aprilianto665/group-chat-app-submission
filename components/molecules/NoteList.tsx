import React, { memo } from "react";
import { Button } from "../atoms/Button";
import { PlusIcon } from "../atoms/Icons";
import { Heading } from "../atoms/Heading";
import type { Note } from "@/types";

interface NoteListProps {
  notes: Note[];
  activeNoteId?: string;
  onSelect: (noteId: string) => void;
  onAdd: () => void;
}

const NoteListComponent: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onSelect,
  onAdd,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <Heading level={6} className="text-gray-900">
          Notes
        </Heading>
        <Button
          variant="icon"
          size="sm"
          onClick={onAdd}
          className="text-[#4F45E4] hover:text-[#4339D1]"
          title="Add note"
        >
          <PlusIcon size={20} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-xs text-gray-600 py-2">No notes yet</div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded ${
                activeNoteId === note.id ? "bg-blue-50" : ""
              }`}
              onClick={() => onSelect(note.id)}
              title={note.title || "Untitled"}
            >
              <div className="font-medium truncate text-gray-900">
                {note.title || "Untitled"}
              </div>
              <div className="text-[11px] text-gray-600">
                {new Date(note.updatedAt).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export const NoteList = memo(NoteListComponent);
