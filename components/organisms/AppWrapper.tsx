"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SpaceManager, ChatArea } from "@/components";
import { useProfileStore } from "@/stores/profileStore";
import type {
  Message,
  User,
  SpaceWithNotes,
  Note,
  NoteBlock,
  Space,
} from "@/types";
import type { AppActions, NoteBlockPayload } from "@/types/app";

export const AppWrapper: React.FC<{
  user: User;
  initialSpaces: SpaceWithNotes[];
  actions: AppActions;
}> = ({ user, initialSpaces, actions }) => {
  const { setUser } = useProfileStore();
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<SpaceWithNotes[]>(() => initialSpaces);
  const [activeNoteIdBySpace, setActiveNoteIdBySpace] = useState<
    Record<string, string | undefined>
  >({});
  const [creatingDraftBySpace, setCreatingDraftBySpace] = useState<
    Record<string, { title: string; blocks: NoteBlock[] } | undefined>
  >({});

  useEffect(() => {
    setUser({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? "/avatar_default.jpg",
    });
  }, [user, setUser]);

  const activeSpace = useMemo(
    () =>
      activeSpaceId ? spaces.find((s) => s.id === activeSpaceId) : undefined,
    [activeSpaceId, spaces]
  );

  const sortedSpaces = useMemo(() => {
    const copy = [...spaces];
    copy.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp;
      const bLast = b.messages[b.messages.length - 1]?.timestamp;
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const aTs = Math.max(aLast ? new Date(aLast).getTime() : 0, aCreated);
      const bTs = Math.max(bLast ? new Date(bLast).getTime() : 0, bCreated);
      return bTs - aTs;
    });
    return copy;
  }, [spaces]);

  const spacesWithUnreadCount: SpaceWithNotes[] = useMemo(() => {
    return sortedSpaces.map((space) => {
      // If space already has preloaded lastMessage/lastMessageSender from server, keep it.
      // Otherwise derive it from local messages.
      const derivedLast = [...space.messages]
        .reverse()
        .find((m) => m.type !== "activity");
      const unreadCount = space.messages.filter((msg) => !msg.isRead).length;
      return {
        ...space,
        lastMessage: space.lastMessage ?? derivedLast?.content,
        lastMessageSender: space.lastMessageSender ?? derivedLast?.senderName,
        unreadCount,
      };
    });
  }, [sortedSpaces]);

  const handleSpaceCreated = async (space: SpaceWithNotes) => {
    setSpaces((prev) => [space, ...prev]);
    setActiveSpaceId(space.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSpaceId) return;
    const newMessage = await actions.sendMessage(activeSpaceId, content);
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? { ...s, messages: [...s.messages, newMessage] }
          : s
      )
    );
  };

  const handleSelectSpace = async (spaceId: string) => {
    setActiveSpaceId(spaceId);
    const detail = await actions.getSpaceDetail(spaceId);
    setSpaces((prev) => {
      const exists = prev.find((s) => s.id === spaceId);
      if (exists) return prev.map((s) => (s.id === spaceId ? detail : s));
      return [detail, ...prev];
    });
  };

  const activeNoteId = activeSpaceId
    ? activeNoteIdBySpace[activeSpaceId]
    : undefined;

  const setActiveNoteForSpace = useCallback(
    (spaceId: string, noteId?: string) => {
      setActiveNoteIdBySpace((prev) => ({ ...prev, [spaceId]: noteId }));
    },
    []
  );

  const handleAddNote = useCallback(() => {
    if (!activeSpaceId) return;
    setCreatingDraftBySpace((prev) => ({
      ...prev,
      [activeSpaceId]: {
        title: "Untitled",
        blocks: [{ id: `block_${Date.now()}`, type: "text", content: "" }],
      },
    }));
  }, [activeSpaceId]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      if (!activeSpaceId) return;
      setActiveNoteForSpace(activeSpaceId, noteId);
    },
    [activeSpaceId, setActiveNoteForSpace]
  );

  const handleSaveNote = useCallback(
    async (draft: { title: string; blocks: NoteBlock[] }) => {
      if (!activeSpaceId || !activeNoteId) return;
      const updated = await actions.updateNote(
        activeNoteId,
        draft.title,
        draft.blocks as unknown as NoteBlockPayload[]
      );
      const { user } = useProfileStore.getState();
      const now = new Date().toISOString();
      const safeTitle = draft.title || "Untitled";
      const safeSender = user?.name ?? "Someone";
      const activityMessage: Message = {
        id: String(Date.now()),
        content: `<strong>${safeSender}</strong> just edited a note: <strong>${safeTitle}</strong>`,
        timestamp: now,
        senderName: user?.name,
        username: user?.username,
        isRead: true,
        type: "activity",
      };
      actions
        .sendActivityMessage?.(activeSpaceId, activityMessage.content)
        .catch(() => {});
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                notes: s.notes.map((n) => (n.id === updated.id ? updated : n)),
                messages: [...s.messages, activityMessage],
              }
            : s
        )
      );
    },
    [activeSpaceId, activeNoteId, actions]
  );

  const handleDeleteNote = useCallback(async () => {
    if (!activeSpaceId || !activeNoteId) return;
    await actions.deleteNote(activeNoteId);
    const { user } = useProfileStore.getState();
    const now = new Date().toISOString();
    const targetSpace = spaces.find((s) => s.id === activeSpaceId);
    const deletedNote = targetSpace?.notes.find((n) => n.id === activeNoteId);
    const safeTitle = deletedNote?.title || "Untitled";
    const safeSender = user?.name ?? "Someone";
    const activityMessage: Message = {
      id: String(Date.now()),
      content: `<strong>${safeSender}</strong> deleted a note: <strong>${safeTitle}</strong>`,
      timestamp: now,
      senderName: user?.name,
      username: user?.username,
      isRead: true,
      type: "activity",
    };
    actions
      .sendActivityMessage?.(activeSpaceId, activityMessage.content)
      .catch(() => {});
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? {
              ...s,
              notes: s.notes.filter((n) => n.id !== activeNoteId),
              messages: [...s.messages, activityMessage],
            }
          : s
      )
    );
    setActiveNoteForSpace(activeSpaceId, undefined);
  }, [activeSpaceId, activeNoteId, setActiveNoteForSpace, actions, spaces]);

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <SpaceManager
          spaces={spacesWithUnreadCount.map(
            ({
              id,
              name,
              icon,
              lastMessage,
              lastMessageSender,
              unreadCount,
            }) => ({
              id,
              name,
              icon,
              lastMessage,
              lastMessageSender,
              unreadCount,
            })
          )}
          activeSpaceId={activeSpaceId ?? undefined}
          onSelectSpace={handleSelectSpace}
          onSpaceCreated={
            handleSpaceCreated as unknown as (space: Space) => void
          }
        />
      </div>
      <div className="flex-1">
        {activeSpace ? (
          <ChatArea
            spaceId={activeSpace.id}
            spaceName={activeSpace.name}
            spaceIcon={activeSpace.icon}
            spaceMembers={activeSpace.members}
            spaceDescription={activeSpace.description}
            messages={activeSpace.messages}
            onSendMessage={handleSendMessage}
            notes={activeSpace.notes}
            activeNoteId={activeNoteId}
            onAddNote={handleAddNote}
            onSelectNote={handleSelectNote}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onReorderNotes={(orderedIds) => {
              actions.reorderNotes(activeSpace.id, orderedIds).then(() => {
                setSpaces((prev) =>
                  prev.map((s) =>
                    s.id === activeSpace.id
                      ? {
                          ...s,
                          notes: orderedIds
                            .map((id) => s.notes.find((n) => n.id === id))
                            .filter((n): n is Note => Boolean(n)),
                        }
                      : s
                  )
                );
              });
            }}
            onLeaveSpace={async () => {
              if (!actions.leaveSpace) return;
              const currId = activeSpace.id;
              await actions.leaveSpace(currId);
              setSpaces((prev) => prev.filter((s) => s.id !== currId));
              setActiveSpaceId((prev) => (prev === currId ? null : prev));
            }}
            draftNote={creatingDraftBySpace[activeSpace.id]}
            onCommitDraft={(draft) => {
              actions
                .createNote(
                  activeSpace.id,
                  draft.title,
                  draft.blocks as unknown as NoteBlockPayload[]
                )
                .then((newNote) => {
                  const { user } = useProfileStore.getState();
                  const now = new Date().toISOString();
                  const safeTitle = draft.title || "Untitled";
                  const safeSender = user?.name ?? "Someone";
                  const activityMessage: Message = {
                    id: String(Date.now()),
                    content: `<strong>${safeSender}</strong> just added a new note: <strong>${safeTitle}</strong>`,
                    timestamp: now,
                    senderName: user?.name,
                    username: user?.username,
                    isRead: true,
                    type: "activity",
                  };
                  actions
                    .sendActivityMessage?.(
                      activeSpace.id,
                      activityMessage.content
                    )
                    .catch(() => {});
                  setSpaces((prev) =>
                    prev.map((s) =>
                      s.id === activeSpace.id
                        ? {
                            ...s,
                            notes: [newNote, ...s.notes],
                            messages: [...s.messages, activityMessage],
                          }
                        : s
                    )
                  );
                  setActiveNoteForSpace(activeSpace.id, newNote.id);
                  setCreatingDraftBySpace((prev) => ({
                    ...prev,
                    [activeSpace.id]: undefined,
                  }));
                });
            }}
            onCancelDraft={() => {
              setCreatingDraftBySpace((prev) => ({
                ...prev,
                [activeSpace!.id]: undefined,
              }));
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a space to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
