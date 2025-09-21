"use client";

import React, { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { SpaceListHeader } from "./SpaceListHeader";

interface SpaceFormProps {
  onCancel?: () => void;
  onSubmit?: (spaceName: string) => void;
  className?: string;
}

export const SpaceForm: React.FC<SpaceFormProps> = ({
  onCancel,
  onSubmit,
  className = "",
}) => {
  const [spaceName, setSpaceName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spaceName.trim() && onSubmit) {
      onSubmit(spaceName.trim());
      setSpaceName("");
    }
  };

  const handleCancel = () => {
    setSpaceName("");
    setSelectedFile(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <SpaceListHeader onCreateGroup={undefined} />
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-4">
            <Button
              type="button"
              variant="text"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2 !p-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
                    Choose File
                  </div>
                </label>
                {selectedFile && (
                  <div className="text-xs text-gray-600 text-center bg-gray-50 px-3 py-1 rounded-full">
                    {selectedFile.name}
                  </div>
                )}
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
    </div>
  );
};
