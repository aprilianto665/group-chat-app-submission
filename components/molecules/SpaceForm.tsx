"use client";

import React, { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { BackArrowIcon, ImageIcon } from "../atoms/Icons";

interface SpaceFormProps {
  onCancel?: () => void;
  onSubmit?: (spaceName: string) => void;
}

export const SpaceForm: React.FC<SpaceFormProps> = ({ onCancel, onSubmit }) => {
  const [spaceName, setSpaceName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spaceName.trim() && onSubmit) {
      onSubmit(spaceName.trim());
      setSpaceName("");
    }
  };

  const handleCancel = () => {
    setSpaceName("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="mb-4">
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2 !p-0"
          >
            <BackArrowIcon className="flex-shrink-0" />
            Space List
          </Button>
        </div>
        <div>
          <label
            htmlFor="groupName"
            className="block text-sm font-medium text-gray-700"
          >
            Name your space
          </label>
          <Input
            id="spaceName"
            type="text"
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Space Photo
          </label>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <ImageIcon className="text-gray-400" />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" />
                <div className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Choose File
                </div>
              </label>
              <p className="text-xs text-gray-500 text-center">
                Upload a photo for your space (optional)
              </p>
            </div>
          </div>
        </div>
        <div>
          <Button
            type="submit"
            variant="send"
            size="md"
            className="w-full rounded-full"
            disabled={!spaceName.trim()}
          >
            Create Space
          </Button>
        </div>
      </form>
    </div>
  );
};
