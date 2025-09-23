import React, { memo } from "react";
import type { Note, NoteBlock } from "@/types";
import { NoteList } from "../molecules/NoteList";
import { NoteEditor } from "../molecules/NoteEditor";

interface NotesPanelProps {
  notes: Note[];
  activeNoteId?: string;
  onAddNote: () => void;
  onSelectNote: (noteId: string) => void;
  onSave: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onDeleteNote: () => void;
  onReorderNotes?: (orderedIds: string[]) => void;
}

const NotesPanelComponent: React.FC<NotesPanelProps> = ({
  notes,
  activeNoteId,
  onAddNote,
  onSelectNote,
  onSave,
  onDeleteNote,
  onReorderNotes,
}) => {
  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r p-3">
        <NoteList
          notes={notes}
          activeNoteId={activeNoteId}
          onSelect={onSelectNote}
          onAdd={onAddNote}
          onReorder={onReorderNotes}
        />
      </div>
      <div className="flex-1 p-3">
        <NoteEditor
          note={activeNote}
          onSave={onSave}
          onDeleteNote={onDeleteNote}
        />
      </div>
    </div>
  );
};

export const NotesPanel = memo(NotesPanelComponent);
