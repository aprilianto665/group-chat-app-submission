import React, { memo } from "react";
import { Button } from "../atoms/Button";
import { TrashIcon } from "../atoms/Icons";

interface BlockMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const BlockMenuComponent: React.FC<BlockMenuProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-3 top-4 mt-2 bg-white border border-gray-200 rounded shadow-md z-10 p-1">
      <Button
        variant="icon"
        size="sm"
        className="text-gray-700 hover:text-red-600 focus:outline-none focus:ring-0 focus:ring-offset-0"
        onClick={() => {
          onClose();
          onDelete();
        }}
        aria-label="Delete block"
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const BlockMenu = memo(BlockMenuComponent);
