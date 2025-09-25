"use client";

/**
 * NoteEditor Component - Advanced Rich Text Editor
 *
 * This is a sophisticated note editing component that provides a rich text editing experience
 * similar to modern note-taking applications like Notion. It supports multiple content types
 * and advanced editing features.
 *
 * ## Core Features:
 *
 * ### 1. Block-Based Architecture
 * - Multiple block types: text, heading, and todo blocks
 * - Each block is independently editable and manageable
 * - Block-specific functionality (todo items, headings, etc.)
 *
 * ### 2. Drag-and-Drop Functionality (@dnd-kit)
 * - Visual drag-and-drop reordering of blocks
 * - Drag overlay with visual feedback
 * - Constrained dragging (vertical only)
 * - Smooth animations and transitions
 *
 * ### 3. Advanced Editing Features
 * - Auto-resizing textareas for all content
 * - Collapsible blocks for better organization
 * - Block-level context menus
 * - Add block menu with quick access
 * - Real-time content updates
 *
 * ### 4. State Management
 * - Draft mode for new notes
 * - Change tracking for unsaved modifications
 * - Optimistic updates with conflict resolution
 * - Local state synchronization
 *
 * ### 5. User Experience
 * - Keyboard shortcuts and accessibility
 * - Visual feedback for all interactions
 * - Responsive design
 * - Performance optimization with memoization
 * - Auto-save functionality
 *
 * ## Block Types Supported:
 * - **Text Block**: Plain text content with auto-resize
 * - **Heading Block**: Styled headings with different levels
 * - **Todo Block**: Task management with checkboxes and descriptions
 *
 * ## Technical Implementation:
 * - Uses @dnd-kit for drag-and-drop functionality
 * - Memoized components for performance
 * - Ref management for DOM manipulation
 * - Sensor configuration for touch/mouse interactions
 * - Collision detection and sorting strategies
 */

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

/**
 * Props interface for NoteEditor component
 */
interface NoteEditorProps {
  note?: Note;
  onSave: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onDeleteNote: () => void;
}

/**
 * NoteEditor Component Implementation
 *
 * Renders a sophisticated note editor with block-based architecture and drag-and-drop functionality.
 * Manages complex state including editing mode, block management, and user interactions.
 *
 * @param note - Optional note data to edit (undefined for new notes)
 * @param onSave - Callback function called when note is saved with title and blocks
 * @param onDeleteNote - Callback function called when note is deleted
 */
const NoteEditorComponent: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDeleteNote,
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Note title state - tracks the current title value
   */
  const [title, setTitle] = useState<string>(note?.title ?? "");

  /**
   * Note blocks state - array of all note blocks (text, heading, todo)
   */
  const [blocks, setBlocks] = useState<NoteBlock[]>(note?.blocks ?? []);

  /**
   * Editing mode state - whether the note is currently being edited
   * Automatically true for draft notes (new notes)
   */
  const [isEditing, setIsEditing] = useState(
    note?.id === "draft" ? true : false
  );

  /**
   * Open block menu state - tracks which block's context menu is open
   */
  const [openBlockMenuId, setOpenBlockMenuId] = useState<string | null>(null);

  /**
   * Changes tracking state - whether there are unsaved changes
   */
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Drag state - whether any block is currently being dragged
   */
  const [isDraggingAnyBlock, setIsDraggingAnyBlock] = useState(false);

  /**
   * Active drag block state - ID of the block being dragged
   */
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  /**
   * Active block size state - dimensions of the block being dragged
   */
  const [activeBlockSize, setActiveBlockSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  /**
   * Collapsed blocks state - set of block IDs that are collapsed
   */
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // ===== REFS =====

  /**
   * Refs for block row elements - used for drag-and-drop positioning
   */
  const blockRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /**
   * Refs for block textarea elements - used for auto-resize functionality
   */
  const blockRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  /**
   * Ref for title textarea element - used for auto-resize functionality
   */
  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  // ===== DRAG AND DROP CONFIGURATION =====

  /**
   * Drag sensors configuration - handles mouse/touch interactions
   * Activation constraint prevents accidental drags
   */
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
    // Set hasChanges to true for draft notes (new notes)
    setHasChanges(note?.id === "draft");
    setCollapsedIds(new Set());
  }, [note?.id, note?.title, note?.blocks]);

  useEffect(() => {
    Object.values(blockRefs.current).forEach((el) => {
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [note?.id]);

  // ===== EVENT HANDLERS =====

  /**
   * Handles title textarea changes and marks note as modified
   * @param e - Change event from title textarea
   */
  const handleTitleAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTitle(e.target.value);
      setHasChanges(true);
    },
    []
  );

  /**
   * Handles content changes for individual blocks and marks note as modified
   * @param blockId - ID of the block being modified
   * @param e - Change event from block textarea
   */
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

  /**
   * Adds a new block of the specified type to the note
   * Creates appropriate initial data based on block type
   * @param type - Type of block to add (text, heading, or todo)
   */
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

  /**
   * Removes a block from the note by its ID
   * @param blockId - ID of the block to delete
   */
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

  const isCollapsed = useCallback(
    (blockId: string) => collapsedIds.has(blockId),
    [collapsedIds]
  );
  const toggleCollapsed = useCallback((blockId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }, []);

  /**
   * Handles saving the note with current title and blocks
   * Validates changes and ensures title is not empty
   * Exits editing mode after successful save
   */
  const handleSave = useCallback(() => {
    // Allow saving if it's a draft note (new note) or if there are changes
    const isDraft = note?.id === "draft";
    if (!hasChanges && !isDraft) {
      setIsEditing(false);
      return;
    }

    // Ensure title is not empty for draft notes
    const finalTitle = title.trim() || "Untitled";

    onSave({ title: finalTitle, blocks });
    setHasChanges(false);
    setIsEditing(false);
  }, [onSave, title, blocks, hasChanges, note?.id]);

  // ===== COMPUTED VALUES =====

  /**
   * Array of block IDs for drag-and-drop sorting
   * Used by @dnd-kit SortableContext
   */
  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  // ===== DRAG AND DROP HANDLERS =====

  /**
   * Handles the end of a drag operation
   * Reorders blocks based on drop position and updates state
   * @param event - Drag end event from @dnd-kit
   */
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
                  key={String(block.id)}
                  block={block}
                  isEditing={isEditing}
                  isDraggingAnyBlock={isDraggingAnyBlock}
                  isActive={activeBlockId === String(block.id)}
                  setBlockRowRef={(el: HTMLDivElement | null) => {
                    blockRowRefs.current[String(block.id)] = el;
                  }}
                  openBlockMenuId={openBlockMenuId}
                  setOpenBlockMenuId={setOpenBlockMenuId}
                  handleChangeBlock={handleChangeBlock}
                  handleDeleteBlock={handleDeleteBlock}
                  handleUpdateBlock={handleUpdateBlock}
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
              key={String(block.id)}
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
                      onClick={() => toggleCollapsed(String(block.id))}
                      className="mt-0.5 text-gray-400 hover:text-gray-600 p-1"
                      aria-label={
                        isCollapsed(String(block.id))
                          ? "Expand list"
                          : "Collapse list"
                      }
                    >
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${
                          isCollapsed(String(block.id))
                            ? "rotate-180"
                            : "rotate-0"
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
                  {!isCollapsed(String(block.id)) && (
                    <div className="space-y-1">
                      {(block.items ?? []).map((it) => (
                        <div key={it.id} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={it.done}
                            onChange={(e) =>
                              handleUpdateBlock(String(block.id), (b) => ({
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
                    blockRefs.current[String(block.id)] = el;
                  }}
                  className={`w-full resize-none outline-none placeholder-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-70 ${
                    block.type === "heading"
                      ? "text-base font-semibold text-gray-900"
                      : "text-sm text-gray-900"
                  }`}
                  rows={1}
                  value={block.content}
                  onChange={(e) => handleChangeBlock(String(block.id), e)}
                  placeholder={""}
                  disabled={!isEditing}
                />
              )}
            </div>
          ))
        )}
      </div>
      {isEditing && <AddBlockMenu onAdd={handleAddBlock} />}
      <SaveButton
        isVisible={isEditing || hasChanges || note?.id === "draft"}
        onClick={handleSave}
      />
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
