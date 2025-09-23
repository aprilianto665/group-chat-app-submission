import { useCallback, useMemo } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export const useDragAndDrop = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  const getItemIds = useCallback(<T extends { id: string }>(items: T[]) => {
    return items.map((item) => item.id);
  }, []);

  return {
    sensors,
    createDragEndHandler,
    getItemIds,
  };
};
