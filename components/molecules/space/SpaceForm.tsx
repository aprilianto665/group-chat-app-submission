"use client";

/**
 * SpaceForm Component
 *
 * Form component for creating new spaces with:
 * - Space name input with validation
 * - Image upload with preview functionality
 * - File handling with proper cleanup
 * - Server action integration for space creation
 * - Form state management with useActionState
 */

import React, { useEffect, useState, useActionState } from "react";
import Image from "next/image";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { FormLabel } from "../../atoms/FormLabel";
import { BackArrowIcon, ImageIcon } from "../../atoms/Icons";
import {
  createSpaceFromForm,
  type CreateSpaceFormState,
} from "@/app/actions/spaces";
import type { SpaceWithNotes } from "@/types";

/**
 * Props interface for SpaceForm component
 */
interface SpaceFormProps {
  onCancel?: () => void;
  onCreated?: (space: SpaceWithNotes) => void;
}

/**
 * SpaceForm Component Implementation
 *
 * Handles space creation form with image upload and validation.
 * Manages form state, file previews, and cleanup of resources.
 *
 * @param onCancel - Callback when form is cancelled
 * @param onCreated - Callback when space is successfully created
 */
export const SpaceForm: React.FC<SpaceFormProps> = ({
  onCancel,
  onCreated,
}) => {
  const [spaceName, setSpaceName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction] = useActionState<CreateSpaceFormState, FormData>(
    createSpaceFromForm,
    {} as CreateSpaceFormState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0);
  const THROTTLE_MS = 2000;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state?.success && state.created && onCreated) {
      onCreated(state.created as unknown as SpaceWithNotes);
      setSpaceName("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [state, onCreated, previewUrl]);

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
      <form
        action={async (formData: FormData) => {
          const now = Date.now();
          if (isSubmitting || now - lastSubmitAt < THROTTLE_MS) return;
          setIsSubmitting(true);
          setLastSubmitAt(now);
          try {
            await formAction(formData);
          } finally {
            setTimeout(() => setIsSubmitting(false), THROTTLE_MS);
          }
        }}
        className="space-y-8"
        aria-busy={isSubmitting}
      >
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
            name="name"
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
                  name="icon"
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
              {state?.error && (
                <p className="text-[11px] text-red-600">{state.error}</p>
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
            disabled={!spaceName.trim() || isSubmitting}
          >
            Create Space
          </Button>
        </div>
      </form>
    </div>
  );
};
