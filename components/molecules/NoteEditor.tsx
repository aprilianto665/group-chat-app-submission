import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Note, NoteBlock } from "@/types";
import { Button } from "../atoms/Button";
import {
  KebabIcon,
  PencilIcon,
  TrashIcon,
  DragDotsIcon,
  TextBlockIcon,
} from "../atoms/Icons";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NoteEditorProps {
  note?: Note;
  onSave: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onDeleteNote: () => void;
}

const NoteEditorComponent: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDeleteNote,
}) => {
  const [title, setTitle] = useState<string>(note?.title ?? "");
  const [blocks, setBlocks] = useState<NoteBlock[]>(note?.blocks ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [openBlockMenuId, setOpenBlockMenuId] = useState<string | null>(null);
  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBlocks(note?.blocks ?? []);
    setIsEditing(false);
    setOpenBlockMenuId(null);
  }, [note?.id, note?.title, note?.blocks]);

  useEffect(() => {
    Object.values(blockRefs.current).forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [note?.id]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChangeBlock = useCallback(
    (blockId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = e.target.value;
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, content } : b))
      );
      autoResize(e.currentTarget);
    },
    []
  );

  const handleAddBlock = useCallback(() => {
    setBlocks((prev) => [
      ...prev,
      { id: `block_${Date.now()}`, type: "text", content: "" },
    ]);
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, []);

  const handleSave = useCallback(() => {
    onSave({ title, blocks });
  }, [onSave, title, blocks]);

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  if (!note) {
    return <div className="text-sm text-gray-600">Select or create a note</div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-2">
        <input
          className="py-1 text-2xl font-bold leading-tight text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full disabled:opacity-70"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          disabled={!isEditing}
        />
        <div className="ml-2 relative">
          <Kebab
            onDelete={onDeleteNote}
            onEdit={() => setIsEditing(true)}
            isEditing={isEditing}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blockIds}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  isEditing={isEditing}
                  openBlockMenuId={openBlockMenuId}
                  setOpenBlockMenuId={setOpenBlockMenuId}
                  handleChangeBlock={handleChangeBlock}
                  handleDeleteBlock={handleDeleteBlock}
                  blockRefs={blockRefs}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="group rounded relative pl-4 pr-4">
              <div className="absolute -left-3 -top-1.5 opacity-0 pointer-events-none" />
              <textarea
                ref={(el) => {
                  blockRefs.current[block.id] = el;
                }}
                className="w-full resize-none outline-none text-sm text-gray-900 placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-70"
                rows={1}
                value={block.content}
                onChange={(e) => handleChangeBlock(block.id, e)}
                placeholder={""}
                disabled={!isEditing}
              />
            </div>
          ))
        )}
      </div>
      {isEditing && (
        <div className="pt-3">
          <Button
            variant="text"
            size="sm"
            className="inline-flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
            onClick={handleAddBlock}
          >
            <TextBlockIcon className="w-4 h-4" />
            Text
          </Button>
        </div>
      )}
      {isEditing && (
        <button
          onClick={handleSave}
          aria-label="Save note"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export const NoteEditor = memo(NoteEditorComponent);

const SortableBlockRow: React.FC<{
  block: NoteBlock;
  isEditing: boolean;
  openBlockMenuId: string | null;
  setOpenBlockMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  handleChangeBlock: (
    blockId: string,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleDeleteBlock: (blockId: string) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}> = ({
  block,
  isEditing,
  openBlockMenuId,
  setOpenBlockMenuId,
  handleChangeBlock,
  handleDeleteBlock,
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
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded relative pl-4 pr-4"
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
        {openBlockMenuId === block.id && (
          <div className="absolute left-3 top-4 mt-2 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
            <Button
              variant="icon"
              size="sm"
              className="text-gray-700 hover:text-red-600 focus:outline-none focus:ring-0 focus:ring-offset-0"
              onClick={() => {
                setOpenBlockMenuId(null);
                handleDeleteBlock(block.id);
              }}
              aria-label="Delete block"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      <textarea
        ref={(el) => {
          blockRefs.current[block.id] = el;
        }}
        className="w-full resize-none outline-none text-sm text-gray-900 placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-70"
        rows={1}
        value={block.content}
        onChange={(e) => handleChangeBlock(block.id, e)}
        placeholder={isEditing ? "Type here..." : ""}
        disabled={!isEditing}
      />
    </div>
  );
};

const Kebab: React.FC<{
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
}> = ({ onDelete, onEdit, isEditing }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <Button
        variant="icon"
        size="sm"
        className="text-gray-500 hover:text-gray-700"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
      >
        <KebabIcon className="w-5 h-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
          <Button
            variant="text"
            size="sm"
            className="w-full flex items-center gap-2 justify-start text-gray-700 hover:bg-gray-50 px-2 py-2"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            disabled={isEditing}
          >
            <PencilIcon />
            Edit note
          </Button>
          <Button
            variant="text"
            size="sm"
            className="w-full flex items-center gap-2 justify-start text-gray-700 hover:bg-gray-50 px-2 py-2"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <TrashIcon />
            Delete note
          </Button>
        </div>
      )}
    </div>
  );
};
