"use client";

/**
 * NotesPanel Component
 *
 * Side panel for collaborative note editing with:
 * - Note list with drag-and-drop reordering
 * - Advanced note editor with block-based architecture
 * - Draft management for unsaved changes
 * - Add, edit, and delete note functionality
 * - Performance optimization with memoization
 * - Responsive layout with split view
 */

import React, { memo } from "react";
import type { Note, NoteBlock } from "@/types";
import { NoteList } from "../../molecules/note/NoteList";
import { NoteEditor } from "../../molecules/note/NoteEditor";

/**
 * Props interface for NotesPanel component
 */
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

/**
 * NotesPanel Component Implementation
 *
 * Renders a split-view panel with note list and editor.
 * Manages note selection, editing, and draft state handling.
 *
 * @param notes - Array of notes to display
 * @param activeNoteId - Currently selected note ID
 * @param onAddNote - Handler for adding new notes
 * @param onSelectNote - Handler for selecting notes
 * @param onSave - Handler for saving note changes
 * @param onDeleteNote - Handler for deleting notes
 * @param onReorderNotes - Optional handler for reordering notes
 * @param draftNote - Current note draft data
 * @param onCommitDraft - Handler for committing note drafts
 * @param onCancelDraft - Handler for canceling note drafts
 */
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
  // ===== COMPUTED VALUES =====

  /**
   * Currently active note object
   * Found by matching activeNoteId with note IDs
   */
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

/**
 * Memoized NotesPanel component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export const NotesPanel = memo(NotesPanelComponent);
