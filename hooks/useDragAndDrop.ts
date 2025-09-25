/**
 * Drag and Drop Hook
 *
 * Custom hook for implementing drag-and-drop functionality using @dnd-kit library.
 * Provides utilities for creating drag handlers, managing sensors, and extracting item IDs.
 */

import { useCallback } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * Custom hook that provides drag-and-drop functionality for sortable lists
 *
 * Returns utilities for:
 * - Drag sensors configuration
 * - Creating drag end handlers for different item types
 * - Extracting item IDs for @dnd-kit SortableContext
 *
 * @returns Object containing sensors, createDragEndHandler function, and getItemIds function
 */
export const useDragAndDrop = () => {
  /**
   * Drag sensors configuration for @dnd-kit
   * Uses PointerSensor with 5px activation constraint to prevent accidental drags
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /**
   * Creates a drag end handler for a specific list of items
   * Handles the reordering logic when drag operation completes
   *
   * @param items - Array of items with id property
   * @param onReorder - Callback function to handle the reordered items
   * @returns Drag end event handler function
   */
  const createDragEndHandler = useCallback(
    <T extends { id: string }>(
      items: T[],
      onReorder: (newItems: T[]) => void
    ) => {
      return (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      };
    },
    []
  );

  /**
   * Extracts IDs from an array of items for @dnd-kit SortableContext
   * Required by @dnd-kit to identify sortable items
   *
   * @param items - Array of items with id property
   * @returns Array of item IDs
   */
  const getItemIds = useCallback(<T extends { id: string }>(items: T[]) => {
    return items.map((item) => item.id);
  }, []);

  return {
    sensors,
    createDragEndHandler,
    getItemIds,
  };
};
