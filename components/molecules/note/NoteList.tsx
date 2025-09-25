"use client";

import React, { memo, useMemo } from "react";
import { Button } from "../../atoms/Button";
import { PlusIcon } from "../../atoms/Icons";
import { Heading } from "../../atoms/Heading";
import type { Note } from "@/types";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NoteListProps {
  notes: Note[];
  activeNoteId?: string;
  onSelect: (noteId: string) => void;
  onAdd: () => void;
  onReorder?: (orderedIds: string[]) => void;
}

const NoteListComponent: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onSelect,
  onAdd,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const uniqueNotes = useMemo(() => {
    return notes.reduce((acc, note) => {
      if (!acc.find((n) => n.id === note.id)) {
        acc.push(note);
      }
      return acc;
    }, [] as Note[]);
  }, [notes]);

  const noteIds = useMemo(() => uniqueNotes.map((n) => n.id), [uniqueNotes]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const oldIndex = noteIds.indexOf(activeId);
    const newIndex = noteIds.indexOf(overId);

    console.log("Drag end:", { activeId, overId, oldIndex, newIndex, noteIds });

    if (oldIndex === -1 || newIndex === -1) {
      console.warn("Invalid drag indices:", { oldIndex, newIndex });
      return;
    }

    const reordered = arrayMove(noteIds, oldIndex, newIndex);
    onReorder?.(reordered);
  };
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {notes.length === 0 ? (
          <div className="text-xs text-gray-600 py-2">No notes yet</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={noteIds}
              strategy={verticalListSortingStrategy}
            >
              {uniqueNotes.map((note, index) => (
                <SortableNoteRow
                  key={`note-${note.id}-${index}`}
                  note={note}
                  isActive={activeNoteId === note.id}
                  onSelect={onSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export const NoteList = memo(NoteListComponent);

const SortableNoteRow: React.FC<{
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
}> = ({ note, isActive, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`w-full text-left px-2 py-2 text-sm hover:bg-gray-50 rounded cursor-grab active:cursor-grabbing ${
        isActive ? "bg-blue-50" : ""
      }`}
      onClick={() => {
        onSelect(note.id);
      }}
      title={note.title || "Untitled"}
      {...attributes}
      {...listeners}
    >
      <div className="font-medium truncate text-gray-900">
        {note.title || "Untitled"}
      </div>
      <div className="text-[11px] text-gray-600">
        {new Date(note.updatedAt).toLocaleString()}
      </div>
    </button>
  );
};
