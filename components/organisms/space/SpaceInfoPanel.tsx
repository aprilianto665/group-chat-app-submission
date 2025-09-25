"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Avatar } from "../../atoms/Avatar";
import { Heading } from "../../atoms/Heading";
import {
  CloseIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
  CheckIcon,
  ChevronDownIcon,
  UserIcon,
  TrashIcon,
} from "../../atoms/Icons";
import { Button } from "../../atoms/Button";
import { LogoutIcon } from "../../atoms/Icons";
import type { SpaceMember } from "@/types";
import {
  createInviteLink,
  updateSpaceInfo,
  updateSpaceFromForm,
  setMemberRole,
  removeMember,
} from "@/app/actions/spaces";
import { useProfileStore } from "@/stores/profileStore";
import { Input } from "../../atoms/Input";
import { AutoResizeTextarea } from "../../atoms/AutoResizeTextarea";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftDescription, setDraftDescription] = useState(description ?? "");
  const [draftIconFile, setDraftIconFile] = useState<File | null>(null);
  const [draftIconPreview, setDraftIconPreview] = useState<string | null>(null);
  const { user } = useProfileStore();
  const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);
  const [isActingOnMemberId, setIsActingOnMemberId] = useState<string | null>(
    null
  );

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

  const handleMembersUpdatedEvent = useCallback(
    (updatedMembers: SpaceMember[]) => {
      if (!spaceId) return;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("members-updated", {
            detail: { spaceId, members: updatedMembers },
          })
        );
      }
    },
    [spaceId]
  );

  const handleMakeAdmin = useCallback(
    async (targetUserId: string) => {
      if (!spaceId) return;
      setIsActingOnMemberId(targetUserId);
      try {
        const updated = await setMemberRole(spaceId, targetUserId, "ADMIN");
        handleMembersUpdatedEvent(updated as unknown as SpaceMember[]);
        if (typeof window !== "undefined") {
          const actorName = user?.name || user?.email || "Someone";
          const target = members.find(
            (mm) => mm.user.id === targetUserId
          )?.user;
          const targetName = target?.name || target?.email || "this member";
          const activityContent = `<strong>${actorName}</strong> made <strong>${targetName}</strong> an admin`;
          window.dispatchEvent(
            new CustomEvent("space-updated", {
              detail: { spaceId, activityContent },
            })
          );
        }
      } finally {
        setIsActingOnMemberId(null);
        setOpenDropdownFor(null);
      }
    },
    [spaceId, handleMembersUpdatedEvent, members, user?.name, user?.email]
  );

  const handleRemoveMember = useCallback(
    async (targetUserId: string) => {
      if (!spaceId) return;
      setIsActingOnMemberId(targetUserId);
      try {
        const updated = await removeMember(spaceId, targetUserId);
        handleMembersUpdatedEvent(updated as unknown as SpaceMember[]);
        if (typeof window !== "undefined") {
          const actorName = user?.name || user?.email || "Someone";
          const target = members.find(
            (mm) => mm.user.id === targetUserId
          )?.user;
          const targetName = target?.name || target?.email || "this member";
          const activityContent = `<strong>${actorName}</strong> removed <strong>${targetName}</strong> from the space`;
          window.dispatchEvent(
            new CustomEvent("space-updated", {
              detail: { spaceId, activityContent },
            })
          );
        }
      } finally {
        setIsActingOnMemberId(null);
        setOpenDropdownFor(null);
      }
    },
    [spaceId, handleMembersUpdatedEvent, members, user?.name, user?.email]
  );

  const handleMakeMember = useCallback(
    async (targetUserId: string) => {
      if (!spaceId) return;
      setIsActingOnMemberId(targetUserId);
      try {
        const updated = await setMemberRole(spaceId, targetUserId, "MEMBER");
        handleMembersUpdatedEvent(updated as unknown as SpaceMember[]);
        if (typeof window !== "undefined") {
          const actorName = user?.name || user?.email || "Someone";
          const target = members.find(
            (mm) => mm.user.id === targetUserId
          )?.user;
          const targetName = target?.name || target?.email || "this member";
          const activityContent = `<strong>${actorName}</strong> removed admin role from <strong>${targetName}</strong>`;
          window.dispatchEvent(
            new CustomEvent("space-updated", {
              detail: { spaceId, activityContent },
            })
          );
        }
      } finally {
        setIsActingOnMemberId(null);
        setOpenDropdownFor(null);
      }
    },
    [spaceId, handleMembersUpdatedEvent, members, user?.name, user?.email]
  );

  const handleToggleEdit = useCallback(async () => {
    if (!isAdmin) return;
    if (!isEditing) {
      setDraftName(name);
      setDraftDescription(description ?? "");
      setDraftIconFile(null);
      setDraftIconPreview(null);
      setIsEditing(true);
      return;
    }

    if (!spaceId) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const newName = draftName.trim();
      const newDesc = draftDescription.trim();
      const originalName = name.trim();
      const originalDesc = (description ?? "").trim();

      if (
        !draftIconFile &&
        newName === originalName &&
        newDesc === originalDesc
      ) {
        setIsEditing(false);
        return;
      }

      let updated: {
        name: string;
        description?: string;
        icon?: string;
      } | null = null;
      if (draftIconFile) {
        const fd = new FormData();
        fd.set("spaceId", spaceId);
        fd.set("name", newName);
        fd.set("description", newDesc);
        fd.set("icon", draftIconFile);
        const res = await updateSpaceFromForm({}, fd);
        if (res.updated) updated = res.updated;
      } else {
        const res = await updateSpaceInfo(spaceId, {
          name: newName,
          description: newDesc || undefined,
        });
        updated = { name: res.name, description: res.description ?? undefined };
      }

      if (updated) {
        if (typeof window !== "undefined") {
          const displayName = user?.name || user?.email || "Someone";
          const activityContent = `<strong>${displayName}</strong> just updated the space info`;
          window.dispatchEvent(
            new CustomEvent("space-updated", {
              detail: {
                spaceId,
                name: updated.name,
                description: updated.description,
                icon: updated.icon,
                activityContent,
              },
            })
          );
        }
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [
    isAdmin,
    isEditing,
    spaceId,
    draftName,
    draftDescription,
    draftIconFile,
    user?.name,
    user?.email,
    name,
    description,
  ]);

  const handlePickIcon = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      setDraftIconFile(file);
      const url = URL.createObjectURL(file);
      setDraftIconPreview(url);
    },
    []
  );
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
        {isAdmin && (
          <Button
            variant="icon"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={handleToggleEdit}
            aria-label={isEditing ? "Save space info" : "Edit space info"}
            disabled={isSaving}
          >
            {isEditing ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <PencilIcon className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-col items-center mb-4">
        <div className="relative mb-3">
          <Avatar
            size="xxl"
            className="shrink-0"
            src={
              (draftIconPreview || icon) &&
              (draftIconPreview || (icon && icon.length > 0 ? icon : undefined))
            }
          >
            {!draftIconPreview &&
              (!icon || icon.length === 0) &&
              name.charAt(0).toUpperCase()}
          </Avatar>
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/0 hover:bg-black/30 transition-colors group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickIcon}
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <PencilIcon className="w-6 h-6" />
              </div>
            </label>
          )}
        </div>
        <div className="w-full max-w-md">
          <Input
            value={isEditing ? draftName : name}
            onChange={(e) => setDraftName(e.target.value)}
            disabled={!isEditing}
            className="text-center text-xl font-semibold disabled:opacity-70 border-b-0 border-transparent focus:border-transparent disabled:border-transparent py-0"
            placeholder="Space name"
          />
          <div className="mt-0">
            <AutoResizeTextarea
              value={isEditing ? draftDescription : description ?? ""}
              onChange={(e) => setDraftDescription(e.target.value)}
              disabled={!isEditing}
              rows={2}
              className="w-full text-center text-gray-600 bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder-gray-400 disabled:opacity-70"
              placeholder="No description"
            />
          </div>
        </div>
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
            <li
              key={`${m.spaceId}:${m.userId}`}
              className="flex items-center py-3 group relative"
              onMouseLeave={() =>
                setOpenDropdownFor((prev) => (prev === m.user.id ? null : prev))
              }
            >
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
              <div className="flex items-center gap-1">
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {mapRole(m.role)}
                </span>
                {isAdmin && user?.id !== m.user.id && (
                  <div className="relative">
                    <button
                      type="button"
                      className="hidden group-hover:inline-flex text-gray-600 hover:text-gray-800 p-1"
                      onClick={() =>
                        setOpenDropdownFor((prev) =>
                          prev === m.user.id ? null : m.user.id
                        )
                      }
                      aria-label="Member actions"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    {openDropdownFor === m.user.id && (
                      <div className="absolute right-0 top-full mt-0.5 w-44 bg-white border border-gray-200 rounded shadow-lg z-10">
                        {m.role !== "ADMIN" ? (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 disabled:opacity-60"
                            onClick={() => handleMakeAdmin(m.user.id)}
                            disabled={isActingOnMemberId === m.user.id}
                          >
                            <UserIcon className="w-4 h-4" />
                            Make admin
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 disabled:opacity-60"
                            onClick={() => handleMakeMember(m.user.id)}
                            disabled={isActingOnMemberId === m.user.id}
                          >
                            <UserIcon className="w-4 h-4" />
                            Remove admin
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                          onClick={() => handleRemoveMember(m.user.id)}
                          disabled={isActingOnMemberId === m.user.id}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
