"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Avatar } from "../../atoms/Avatar";
import { Heading } from "../../atoms/Heading";
import { CloseIcon, CopyIcon, LinkIcon } from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { LogoutIcon } from "../../atoms/Icons";
import type { SpaceMember } from "@/types";
import { createInviteLink } from "@/app/actions/spaces";
import { useProfileStore } from "@/stores/profileStore";

interface SpaceInfoPanelProps {
  name: string;
  icon?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
  members?: SpaceMember[];
  onLeaveSpace?: () => void;
  spaceId?: string;
}

const SpaceInfoPanelComponent: React.FC<SpaceInfoPanelProps> = ({
  name,
  icon,
  description,
  className = "",
  onClose,
  members = [],
  onLeaveSpace,
  spaceId,
}) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useProfileStore();

  const isAdmin = useMemo(() => {
    if (!user?.id) return false;
    const me = members.find((m) => m.user.id === user.id);
    return me?.role === "ADMIN";
  }, [members, user?.id]);

  const mapRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Space Admin";
      default:
        return "Member";
    }
  };

  const absoluteInviteUrl = useMemo(() => {
    if (!inviteUrl) return null;
    if (typeof window === "undefined") return inviteUrl;
    try {
      const u = new URL(inviteUrl, window.location.origin);
      return u.toString();
    } catch {
      return inviteUrl;
    }
  }, [inviteUrl]);

  const handleGenerateInvite = useCallback(async () => {
    if (!spaceId) return;
    setIsGenerating(true);
    try {
      const { url } = await createInviteLink(spaceId, 60);
      setInviteUrl(url);
      setInviteOpen(true);
    } finally {
      setIsGenerating(false);
    }
  }, [spaceId]);

  const handleCopy = useCallback(() => {
    if (!absoluteInviteUrl) return;
    navigator.clipboard.writeText(absoluteInviteUrl).catch(() => {});
  }, [absoluteInviteUrl]);
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
          {isAdmin && (
            <li>
              <button
                type="button"
                onClick={handleGenerateInvite}
                disabled={!spaceId || isGenerating}
                className="w-full flex items-center py-3 text-left disabled:opacity-60"
              >
                <div className="w-10 h-10 mr-3 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {isGenerating ? "Generating link..." : "Invite via link"}
                  </div>
                </div>
              </button>
              {inviteOpen && absoluteInviteUrl && (
                <div className="mt-2 p-2 border rounded bg-gray-50 flex items-center gap-2">
                  <input
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                    readOnly
                    value={absoluteInviteUrl}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={handleCopy}
                    aria-label="Copy invite link"
                    title="Copy"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          )}
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
