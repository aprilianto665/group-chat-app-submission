"use client";

import React from "react";
import { Avatar } from "../../atoms/Avatar";
import { Heading } from "../../atoms/Heading";
import { CloseIcon } from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { LogoutIcon } from "../../atoms/Icons";
import type { SpaceMember } from "@/types";

interface SpaceInfoPanelProps {
  name: string;
  icon?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
  members?: SpaceMember[];
  onLeaveSpace?: () => void;
}

const SpaceInfoPanelComponent: React.FC<SpaceInfoPanelProps> = ({
  name,
  icon,
  description,
  className = "",
  onClose,
  members = [],
  onLeaveSpace,
}) => {
  const mapRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Space Admin";
      default:
        return "Member";
    }
  };
  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center mb-6 gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close group info"
            className="text-gray-600 hover:text-gray-800"
            title="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        )}
        <Heading level={6} className="text-gray-900">
          Manage your space
        </Heading>
      </div>
      <div className="flex items-center justify-between mb-2">
        <Heading level={6} className="text-gray-900">
          Space info
        </Heading>
      </div>
      <div className="flex flex-col items-center mb-4">
        <Avatar
          size="xxl"
          className="mb-3 shrink-0"
          src={icon && icon.length > 0 ? icon : undefined}
        >
          {(!icon || icon.length === 0) && name.charAt(0).toUpperCase()}
        </Avatar>
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          {name}
        </h2>
        <p className="text-gray-600 mt-1 max-w-prose whitespace-pre-line text-center">
          {description && description.trim().length > 0
            ? description
            : "No description"}
        </p>
      </div>
      <div className="my-6 border-t border-gray-200" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <Heading level={6} className="text-gray-900">
            {members.length} {members.length === 1 ? "Member" : "Members"}
          </Heading>
        </div>
        <ul className="space-y-1">
          {members.map((m) => (
            <li key={m.id} className="flex items-center py-3">
              <Avatar
                size="md"
                className="mr-3 shrink-0"
                src={
                  m.user.avatar && m.user.avatar.length > 0
                    ? m.user.avatar
                    : undefined
                }
              >
                {(!m.user.avatar || m.user.avatar.length === 0) &&
                  (m.user.name?.charAt(0).toUpperCase() ||
                    m.user.username.charAt(0).toUpperCase())}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {m.user.name}
                </div>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                {mapRole(m.role)}
              </span>
            </li>
          ))}
          {members.length === 0 && (
            <li className="py-3 text-sm text-gray-500">No members</li>
          )}
        </ul>
        <div className="mt-6">
          <Button
            variant="text"
            size="sm"
            className="text-red-600 flex items-center gap-2"
            onClick={() => onLeaveSpace?.()}
          >
            <LogoutIcon className="w-4 h-4" />
            Leave space
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SpaceInfoPanel = SpaceInfoPanelComponent;
