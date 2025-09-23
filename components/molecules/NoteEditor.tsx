import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Note, NoteBlock, NoteBlockItem } from "@/types";
import { Button } from "../atoms/Button";
import {
  KebabIcon,
  PencilIcon,
  TrashIcon,
  DragDotsIcon,
  TextBlockIcon,
  HeadingIcon,
  TodoIcon,
  PlusIcon,
  ChevronDownIcon,
} from "../atoms/Icons";
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
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    if (titleRef.current) {
      autoResize(titleRef.current);
    }
  }, [note?.id]);

  const handleTitleAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTitle(e.target.value);
      autoResize(e.currentTarget);
    },
    []
  );

  useEffect(() => {
    if (titleRef.current) {
      autoResize(titleRef.current);
    }
  }, [title]);

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
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
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
    onSave({ title, blocks });
    setHasChanges(false);
  }, [onSave, title, blocks]);

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
        return arrayMove(prev, oldIndex, 0);
      }

      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  if (!note) {
    return <div className="text-sm text-gray-600">Select or create a note</div>;
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-2">
        <textarea
          ref={titleRef}
          className="py-1 text-2xl font-bold leading-tight text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full disabled:opacity-70 resize-none overflow-hidden"
          placeholder="Untitled"
          rows={1}
          value={title}
          onChange={
            isEditing ? handleTitleAreaChange : (e) => setTitle(e.target.value)
          }
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
            {isDraggingAnyBlock && <TopDropZone />}
            <SortableContext
              items={blockIds}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  isEditing={isEditing}
                  isDraggingAnyBlock={isDraggingAnyBlock}
                  isActive={activeBlockId === block.id}
                  setBlockRowRef={(el) => {
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
      {(isEditing || hasChanges) && (
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

const AddBlockMenu: React.FC<{
  onAdd: (type: NoteBlock["type"]) => void;
}> = ({ onAdd }) => {
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

export const NoteEditor = memo(NoteEditorComponent);

const TopDropZone: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({ id: "top-drop-zone" });
  return (
    <div
      ref={setNodeRef}
      className={`w-full h-3 -mt-2 mb-1 ${isOver ? "bg-blue-100/70" : ""}`}
      aria-hidden
      style={{ borderRadius: 4 }}
    />
  );
};

const SortableBlockRow: React.FC<{
  block: NoteBlock;
  isEditing: boolean;
  isDraggingAnyBlock: boolean;
  isActive: boolean;
  setBlockRowRef: (el: HTMLDivElement | null) => void;
  openBlockMenuId: string | null;
  setOpenBlockMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  handleChangeBlock: (
    blockId: string,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleDeleteBlock: (blockId: string) => void;
  handleUpdateBlock: (
    blockId: string,
    updater: (b: NoteBlock) => NoteBlock
  ) => void;
  handleUpdateBlockUI?: (
    blockId: string,
    updater: (b: NoteBlock) => NoteBlock
  ) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
}> = ({
  block,
  isEditing,
  isDraggingAnyBlock,
  isActive,
  setBlockRowRef,
  openBlockMenuId,
  setOpenBlockMenuId,
  handleChangeBlock,
  handleDeleteBlock,
  handleUpdateBlock,
  handleUpdateBlockUI,
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
  const nodeElRef = React.useRef<HTMLDivElement | null>(null);
  const [dragWidth, setDragWidth] = useState<number | undefined>(undefined);
  const [dragHeight, setDragHeight] = useState<number | undefined>(undefined);

  const handleSetNodeRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    nodeElRef.current = el;
    setBlockRowRef(el);
  };

  useEffect(() => {
    if (isDragging && nodeElRef.current) {
      const rect = nodeElRef.current.getBoundingClientRect();
      setDragWidth(rect.width);
      setDragHeight(rect.height);
    } else if (!isDragging) {
      setDragWidth(undefined);
      setDragHeight(undefined);
    }
  }, [isDragging]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    width: isDragging && dragWidth ? `${dragWidth}px` : undefined,
    height: isDragging && dragHeight ? `${dragHeight}px` : undefined,
    zIndex: isDragging ? 60 : undefined,
  };

  const contentContainerRef = React.useRef<HTMLDivElement | null>(null);
  const updateUIOnly = handleUpdateBlockUI ?? handleUpdateBlock;
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");

  useEffect(() => {
    if (!contentContainerRef.current) return;
    const areas = contentContainerRef.current.querySelectorAll(
      "textarea"
    ) as NodeListOf<HTMLTextAreaElement>;
    areas.forEach((el) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [block, isEditing]);

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      handleUpdateBlock(block.id, (b) => ({
        ...b,
        items: [
          ...(b.items ?? []),
          {
            id: `todo_item_${Date.now()}`,
            text: newTodoText.trim(),
            done: false,
            description: newTodoDescription.trim() || undefined,
          },
        ],
      }));
      setNewTodoText("");
      setNewTodoDescription("");
      setShowAddTodoModal(false);
    }
  };

  const itemIds = useMemo(
    () => (block.items ?? []).map((i) => i.id),
    [block.items]
  );
  const itemSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleTodoDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const items = block.items ?? [];
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex);
      handleUpdateBlock(block.id, (b) => ({
        ...b,
        items: newItems,
      }));
    },
    [block.id, block.items, handleUpdateBlock]
  );

  return (
    <div
      ref={handleSetNodeRef}
      style={style}
      className={`group rounded relative pl-4 pr-4 mb-1.5 ${
        isActive ? "invisible" : ""
      }`}
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
      {block.type === "todo" ? (
        <div
          className={`w-full rounded-md border border-gray-200 bg-gray-50 p-3 ${
            isDraggingAnyBlock ? "pointer-events-none" : ""
          }`}
          ref={contentContainerRef}
        >
          <div className="flex items-start gap-2">
            <textarea
              className="flex-1 w-full resize-none overflow-hidden bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base font-semibold text-gray-900 placeholder-gray-500 whitespace-pre-wrap break-words"
              placeholder="To-do list title"
              rows={1}
              value={block.todoTitle ?? ""}
              onChange={(e) => {
                handleUpdateBlock(block.id, (b) => ({
                  ...b,
                  todoTitle: e.target.value,
                }));
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              disabled={!isEditing}
            />
            <button
              type="button"
              onClick={() =>
                updateUIOnly(block.id, (b) => ({
                  ...b,
                  collapsed: !b.collapsed,
                }))
              }
              className="mt-0.5 text-gray-400 hover:text-gray-600 p-1"
              aria-label={block.collapsed ? "Expand list" : "Collapse list"}
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
              const completedItems = items.filter((item) => item.done).length;
              const progressPercentage =
                totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
                    style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                  />
                </div>
              );
            })()}
          </div>
          {!block.collapsed && (
            <div className="mt-2 space-y-2">
              <DndContext
                sensors={itemSensors}
                collisionDetection={closestCorners}
                onDragEnd={handleTodoDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext
                  items={itemIds}
                  strategy={verticalListSortingStrategy}
                >
                  {(block.items ?? []).map((it) => (
                    <SortableTodoRow
                      key={it.id}
                      item={it}
                      isEditing={isEditing}
                      onUpdateItem={(updater) =>
                        handleUpdateBlock(block.id, (b) => ({
                          ...b,
                          items: (b.items ?? []).map((x) =>
                            x.id === it.id ? updater(x) : x
                          ),
                        }))
                      }
                      onDeleteItem={() =>
                        handleUpdateBlock(block.id, (b) => ({
                          ...b,
                          items: (b.items ?? []).filter((x) => x.id !== it.id),
                        }))
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
          {!block.collapsed && (
            <div className="relative">
              <Button
                variant="text"
                size="sm"
                className="inline-flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded"
                onClick={() => setShowAddTodoModal(!showAddTodoModal)}
              >
                <PlusIcon className="w-4 h-4" />
                Add to-do item
              </Button>
              {showAddTodoModal && (
                <div className="mt-2 w-full">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type your first to-do here"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      className="w-full bg-transparent outline-none focus:outline-none px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newTodoDescription}
                      onChange={(e) => setNewTodoDescription(e.target.value)}
                      className="w-full bg-transparent outline-none focus:outline-none px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => {
                          setNewTodoText("");
                          setNewTodoDescription("");
                          setShowAddTodoModal(false);
                        }}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={handleAddTodo}
                        disabled={!newTodoText.trim()}
                        className="px-2 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        Add to the list
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
          placeholder={isEditing ? "Type here..." : ""}
          disabled={!isEditing}
        />
      )}
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
          {!isEditing && (
            <Button
              variant="text"
              size="sm"
              className="w-full flex items-center gap-2 justify-start text-gray-700 hover:bg-gray-50 px-2 py-2"
              onClick={() => {
                setOpen(false);
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

const SortableTodoRow: React.FC<{
  item: NoteBlockItem;
  isEditing: boolean;
  onUpdateItem: (updater: (i: NoteBlockItem) => NoteBlockItem) => void;
  onDeleteItem: () => void;
}> = ({ item, isEditing, onUpdateItem, onDeleteItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 60 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        ref={setActivatorNodeRef}
        className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 focus:outline-none cursor-grab active:cursor-grabbing"
        aria-label="Drag item"
        disabled={!isEditing}
        {...attributes}
        {...listeners}
      >
        <DragDotsIcon className="w-4 h-4" />
      </button>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900"
        checked={item.done}
        onChange={(e) =>
          onUpdateItem((i) => ({ ...i, done: e.target.checked }))
        }
      />
      <div className="flex-1 min-w-0">
        <textarea
          className="w-full resize-none overflow-hidden bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 whitespace-pre-wrap break-words"
          placeholder="To-do item"
          rows={1}
          value={item.text}
          onChange={(e) => {
            onUpdateItem((i) => ({ ...i, text: e.target.value }));
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
          }}
          disabled={!isEditing}
        />
        {item.description ? (
          <div className="text-xs text-gray-500 whitespace-pre-wrap break-words mt-0.5">
            {item.description}
          </div>
        ) : null}
      </div>
      {isEditing && (
        <Button
          variant="icon"
          size="sm"
          className="text-gray-400 hover:text-red-600"
          aria-label="Delete to-do item"
          onClick={onDeleteItem}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
