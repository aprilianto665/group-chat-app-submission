"use client";

import React, { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { GroupListHeader } from "./GroupListHeader";

interface GroupFormProps {
  onCancel?: () => void;
  onSubmit?: (groupName: string) => void;
  className?: string;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  onCancel,
  onSubmit,
  className = "",
}) => {
  const [groupName, setGroupName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && onSubmit) {
      onSubmit(groupName.trim());
      setGroupName("");
    }
  };

  const handleCancel = () => {
    setGroupName("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <GroupListHeader onCreateGroup={undefined} />
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Group List
            </Button>
          </div>
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name your space
            </label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="send"
              size="md"
              className="w-full"
              disabled={!groupName.trim()}
            >
              Create Space
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
