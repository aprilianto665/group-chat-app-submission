"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { FormLabel } from "../atoms/FormLabel";
import { BackArrowIcon, ImageIcon } from "../atoms/Icons";

interface SpaceFormProps {
  onCancel?: () => void;
  onSubmit?: (spaceName: string) => void;
}

export const SpaceForm: React.FC<SpaceFormProps> = ({ onCancel, onSubmit }) => {
  const [spaceName, setSpaceName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spaceName.trim() && onSubmit) {
      onSubmit(spaceName.trim());
      setSpaceName("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setSpaceName("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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
          <FormLabel htmlFor="spaceName" required>
            Name your space
          </FormLabel>
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
          <FormLabel className="mb-2">Space Photo</FormLabel>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400" />
                )}
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
              <p className="text-xs text-gray-500 text-center">
                Upload a photo for your space (optional)
              </p>
              {selectedFile && (
                <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
              )}
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
