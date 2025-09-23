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
  draftNote?: { title: string; blocks: NoteBlock[] };
  onCommitDraft?: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onCancelDraft?: () => void;
}

const NotesPanelComponent: React.FC<NotesPanelProps> = ({
  notes,
  activeNoteId,
  onAddNote,
  onSelectNote,
  onSave,
  onDeleteNote,
  onReorderNotes,
  draftNote,
  onCommitDraft,
  onCancelDraft,
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
        {draftNote ? (
          <NoteEditor
            note={{
              id: "draft",
              title: draftNote.title,
              blocks: draftNote.blocks,
              createdAt: "",
              updatedAt: "",
            }}
            onSave={(d) => onCommitDraft?.(d)}
            onDeleteNote={() => onCancelDraft?.()}
          />
        ) : (
          <NoteEditor
            note={activeNote}
            onSave={onSave}
            onDeleteNote={onDeleteNote}
          />
        )}
      </div>
    </div>
  );
};

export const NotesPanel = memo(NotesPanelComponent);
