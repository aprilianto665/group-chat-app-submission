"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Note, NoteBlock } from "@/types";
import { NoteHeader } from "./NoteHeader";
import { NoteBlockRow } from "./NoteBlockRow";
import { AddBlockMenu } from "./AddBlockMenu";
import { SaveButton } from "./SaveButton";
import {
  DragDotsIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
} from "../../atoms/Icons";
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

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
  const [isEditing, setIsEditing] = useState(
    note?.id === "draft" ? true : false
  );
  const [openBlockMenuId, setOpenBlockMenuId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDraggingAnyBlock, setIsDraggingAnyBlock] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeBlockSize, setActiveBlockSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const blockRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBlocks(note?.blocks ?? []);
    setIsEditing(note?.id === "draft");
    setOpenBlockMenuId(null);
    setHasChanges(false);
  }, [note?.id, note?.title, note?.blocks]);

  useEffect(() => {
    Object.values(blockRefs.current).forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [note?.id]);

  const handleTitleAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTitle(e.target.value);
      setHasChanges(true);
    },
    []
  );

  const handleChangeBlock = useCallback(
    (blockId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const content = e.target.value;
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, content } : b))
      );
      setHasChanges(true);
    },
    []
  );

  const handleAddBlock = useCallback((type: NoteBlock["type"]) => {
    setBlocks((prev) => [
      ...prev,
      type === "todo"
        ? {
            id: `block_${Date.now()}`,
            type,
            content: "",
            todoTitle: "",
            items: [],
          }
        : { id: `block_${Date.now()}`, type, content: "" },
    ]);
    setHasChanges(true);
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setHasChanges(true);
  }, []);

  const handleUpdateBlock = useCallback(
    (blockId: string, updater: (b: NoteBlock) => NoteBlock) => {
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? updater(b) : b)));
      setHasChanges(true);
    },
    []
  );

  const handleUpdateBlockUI = useCallback(
    (blockId: string, updater: (b: NoteBlock) => NoteBlock) => {
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? updater(b) : b)));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }
    onSave({ title, blocks });
    setHasChanges(false);
    setIsEditing(false);
  }, [onSave, title, blocks, hasChanges]);

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex =
        over.id === "top-drop-zone"
          ? 0
          : prev.findIndex((b) => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;

      if (newIndex === 0 && oldIndex > 0) {
        const next = arrayMove(prev, oldIndex, 0);
        setHasChanges(true);
        return next;
      }

      const next = arrayMove(prev, oldIndex, newIndex);
      setHasChanges(true);
      return next;
    });
  }, []);

  if (!note) {
    return <div className="text-sm text-gray-600">Select or create a note</div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      <NoteHeader
        title={title}
        isEditing={isEditing}
        onTitleChange={handleTitleAreaChange}
        onEdit={() => setIsEditing(true)}
        onDelete={onDeleteNote}
        titleRef={titleRef as React.RefObject<HTMLTextAreaElement>}
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isEditing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => {
              setIsDraggingAnyBlock(true);
              setActiveBlockId(String(e.active.id));
              const el = blockRowRefs.current[String(e.active.id)];
              if (el) {
                const rect = el.getBoundingClientRect();
                setActiveBlockSize({ width: rect.width, height: rect.height });
              } else {
                type Size = { width: number; height: number };
                type RectLike = {
                  current?: { translated?: Size; initial?: Size };
                };
                const rectLike = e.active.rect as unknown as RectLike;
                const rect =
                  rectLike.current?.translated ||
                  rectLike.current?.initial ||
                  null;
                if (rect) {
                  setActiveBlockSize({
                    width: rect.width,
                    height: rect.height,
                  });
                } else {
                  setActiveBlockSize(null);
                }
              }
            }}
            onDragEnd={(event) => {
              handleDragEnd(event);
              setIsDraggingAnyBlock(false);
              setActiveBlockId(null);
              setActiveBlockSize(null);
            }}
            onDragCancel={() => {
              setIsDraggingAnyBlock(false);
              setActiveBlockId(null);
              setActiveBlockSize(null);
            }}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <TopDropZone />
            <SortableContext
              items={blockIds}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <NoteBlockRow
                  key={block.id}
                  block={block}
                  isEditing={isEditing}
                  isDraggingAnyBlock={isDraggingAnyBlock}
                  isActive={activeBlockId === block.id}
                  setBlockRowRef={(el: HTMLDivElement | null) => {
                    blockRowRefs.current[block.id] = el;
                  }}
                  openBlockMenuId={openBlockMenuId}
                  setOpenBlockMenuId={setOpenBlockMenuId}
                  handleChangeBlock={handleChangeBlock}
                  handleDeleteBlock={handleDeleteBlock}
                  handleUpdateBlock={handleUpdateBlock}
                  handleUpdateBlockUI={handleUpdateBlockUI}
                  blockRefs={blockRefs}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {(() => {
                const active = blocks.find((b) => b.id === activeBlockId);
                if (!active) return null;
                return (
                  <div
                    className="group rounded relative pl-4 pr-4"
                    style={{
                      width: activeBlockSize?.width,
                      height: activeBlockSize?.height,
                      boxSizing: "border-box",
                    }}
                  >
                    <div className="absolute left-0 top-0 opacity-100">
                      <div className="w-5 h-5 p-0 text-gray-400">
                        <DragDotsIcon className="w-4 h-4" />
                      </div>
                    </div>
                    {active.type === "todo" ? (
                      <div className="w-full rounded-md border border-gray-200 bg-gray-50 p-3">
                        <div className="w-full text-base font-semibold text-gray-900">
                          {active.todoTitle || "To-do list title"}
                        </div>
                        <div className="mt-2">
                          {(() => {
                            const items = active.items ?? [];
                            const totalItems = items.length;
                            const completedItems = items.filter(
                              (item) => item.done
                            ).length;
                            const progressPercentage =
                              totalItems > 0
                                ? (completedItems / totalItems) * 100
                                : 0;

                            return (
                              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ease-in-out ${
                                    progressPercentage === 100
                                      ? "bg-green-500"
                                      : progressPercentage > 0
                                      ? "bg-blue-500"
                                      : "bg-gray-300"
                                  }`}
                                  style={{
                                    width: `${Math.max(
                                      progressPercentage,
                                      2
                                    )}%`,
                                  }}
                                />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-2 space-y-2">
                          {(active.items ?? []).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2"
                            >
                              <div className="w-5 h-5 p-0 text-gray-400">
                                <DragDotsIcon className="w-4 h-4" />
                              </div>
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900"
                                checked={item.done}
                                readOnly
                              />
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-sm whitespace-normal break-all ${
                                    item.done
                                      ? "line-through text-gray-400"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.text}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 whitespace-pre-wrap break-words mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              <button
                                className="text-gray-400 hover:text-red-600 ml-2"
                                aria-label="Delete to-do item"
                                type="button"
                                tabIndex={-1}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="relative mt-2">
                          <div className="inline-flex items-center gap-2 text-gray-700 px-2 py-1 rounded">
                            <PlusIcon className="w-4 h-4" />
                            Add to-do item
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-full resize-none outline-none placeholder-gray-500 bg-transparent border-none ${
                          active.type === "heading"
                            ? "text-base font-semibold text-gray-900"
                            : "text-sm text-gray-900"
                        }`}
                      >
                        {active.content || "Type here..."}
                      </div>
                    )}
                  </div>
                );
              })()}
            </DragOverlay>
          </DndContext>
        ) : (
          blocks.map((block) => (
            <div
              key={block.id}
              className="group rounded relative pl-4 pr-4 mb-1.5"
            >
              <div className="absolute -left-3 -top-1.5 opacity-0 pointer-events-none" />
              {block.type === "todo" ? (
                <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 text-base font-semibold text-gray-900 whitespace-normal break-all">
                      {block.todoTitle}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateBlockUI(block.id, (b) => ({
                          ...b,
                          collapsed: !b.collapsed,
                        }))
                      }
                      className="mt-0.5 text-gray-400 hover:text-gray-600 p-1"
                      aria-label={
                        block.collapsed ? "Expand list" : "Collapse list"
                      }
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          block.collapsed ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-2">
                    {(() => {
                      const items = block.items ?? [];
                      const totalItems = items.length;
                      const completedItems = items.filter(
                        (item) => item.done
                      ).length;
                      const progressPercentage =
                        totalItems > 0
                          ? (completedItems / totalItems) * 100
                          : 0;

                      return (
                        <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ease-in-out ${
                              progressPercentage === 100
                                ? "bg-green-500"
                                : progressPercentage > 0
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                            style={{
                              width: `${Math.max(progressPercentage, 2)}%`,
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  {!block.collapsed && (
                    <div className="space-y-1">
                      {(block.items ?? []).map((it) => (
                        <div key={it.id} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={it.done}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, (b) => ({
                                ...b,
                                items: (b.items ?? []).map((x) =>
                                  x.id === it.id
                                    ? { ...x, done: e.target.checked }
                                    : x
                                ),
                              }))
                            }
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900"
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm whitespace-normal break-all ${
                                it.done
                                  ? "line-through text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {it.text}
                            </div>
                            {it.description ? (
                              <div className="text-xs text-gray-500 whitespace-pre-wrap break-words mt-0.5">
                                {it.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  ref={(el) => {
                    blockRefs.current[block.id] = el;
                  }}
                  className={`w-full resize-none outline-none placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-70 ${
                    block.type === "heading"
                      ? "text-base font-semibold text-gray-900"
                      : "text-sm text-gray-900"
                  }`}
                  rows={1}
                  value={block.content}
                  onChange={(e) => handleChangeBlock(block.id, e)}
                  placeholder={""}
                  disabled={!isEditing}
                />
              )}
            </div>
          ))
        )}
      </div>
      {isEditing && <AddBlockMenu onAdd={handleAddBlock} />}
      <SaveButton isVisible={isEditing || hasChanges} onClick={handleSave} />
    </div>
  );
};

export const NoteEditor = memo(NoteEditorComponent);

const TopDropZone: React.FC = () => {
  const { setNodeRef } = useDroppable({ id: "top-drop-zone" });
  return (
    <div
      ref={setNodeRef}
      className={`w-full h-8 -mt-4 mb-2`}
      aria-hidden
      style={{ borderRadius: 4 }}
    />
  );
};
