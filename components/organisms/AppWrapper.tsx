"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SpaceManager, ChatArea } from "@/components";
import { useProfileStore } from "@/stores/profileStore";
import type { Message, User, SpaceWithNotes, Note, NoteBlock } from "@/types";

const initialSpaces: SpaceWithNotes[] = [
  {
    id: "1",
    name: "General Discussion",
    createdAt: "2024-01-15T10:00:00",
    messages: [
      {
        id: "1",
        content: "Hey everyone! How's it going?",
        timestamp: "2024-01-15T10:30:00",
        senderName: "John Doe",
        username: "johndoe",
        isRead: false,
      },
      {
        id: "2",
        content: "Great! Working on the new project",
        timestamp: "2024-01-15T10:32:00",
        senderName: "ambatucode",
        username: "ambatucode",
        isRead: false,
      },
      {
        id: "3",
        content: "Same here, just finished the design mockups",
        timestamp: "2024-01-15T10:35:00",
        senderName: "Jane Smith",
        username: "janesmith",
        isRead: false,
      },
    ],
    notes: [],
  },
  {
    id: "2",
    name: "Project Alpha",
    createdAt: "2024-02-10T08:50:00",
    messages: [
      {
        id: "1",
        content: "Kickoff notes updated in the doc.",
        timestamp: "2024-02-10T09:00:00",
        senderName: "PM",
        username: "pm",
        isRead: true,
      },
      {
        id: "2",
        content: "The deadline is next week",
        timestamp: "2024-02-11T12:00:00",
        senderName: "Lead",
        username: "lead",
        isRead: true,
      },
    ],
    notes: [],
  },
  {
    id: "3",
    name: "Random Chat",
    createdAt: "2024-03-01T19:50:00",
    messages: [
      {
        id: "1",
        content: "Did you see that movie?",
        timestamp: "2024-03-01T20:00:00",
        senderName: "Friend",
        username: "friend",
        isRead: false,
      },
      {
        id: "2",
        content: "Not yet, is it good?",
        timestamp: "2024-03-01T20:05:00",
        senderName: "amb4tron",
        username: "ambatucode",
        isRead: true,
      },
    ],
    notes: [],
  },
  {
    id: "4",
    name: "Tech Updates",
    createdAt: "2024-04-05T07:50:00",
    messages: [
      {
        id: "1",
        content: "New framework released!",
        timestamp: "2024-04-05T08:00:00",
        senderName: "Bot",
        username: "bot",
        isRead: true,
      },
    ],
    notes: [],
  },
];

export const AppWrapper: React.FC<{ user: User }> = ({ user }) => {
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

  const spacesWithUnreadCount = useMemo(() => {
    return sortedSpaces.map((space) => {
      const unreadCount = space.messages.filter((msg) => !msg.isRead).length;
      return {
        ...space,
        unreadCount,
      };
    });
  }, [sortedSpaces]);

  const handleSpaceCreated = (spaceName: string) => {
    const newId = String(Date.now());
    setSpaces((prev) => [
      ...prev,
      {
        id: newId,
        name: spaceName,
        createdAt: new Date().toISOString(),
        messages: [],
        notes: [],
      },
    ]);
    setActiveSpaceId(newId);
  };

  const handleSendMessage = (content: string) => {
    const { user } = useProfileStore.getState();
    const newMessage: Message = {
      id: String(Date.now()),
      content,
      timestamp: new Date().toISOString(),
      senderName: user?.name,
      username: user?.username,
      isRead: true,
    };
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? {
              ...s,
              messages: [...s.messages, newMessage],
            }
          : s
      )
    );
  };

  const handleSelectSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === spaceId
          ? {
              ...s,
              messages: s.messages.map((msg) => ({ ...msg, isRead: true })),
            }
          : s
      )
    );
  };

  // Notes handlers (per space)
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
    // Start draft mode instead of creating immediately
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

  // Save note changes only on explicit Save
  const handleSaveNote = useCallback(
    (draft: { title: string; blocks: NoteBlock[] }) => {
      if (!activeSpaceId || !activeNoteId) return;
      const now = new Date().toISOString();
      const { user } = useProfileStore.getState();
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
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                notes: s.notes.map((n) =>
                  n.id === activeNoteId
                    ? {
                        ...n,
                        title: draft.title,
                        blocks: draft.blocks,
                        updatedAt: now,
                      }
                    : n
                ),
                messages: [...s.messages, activityMessage],
              }
            : s
        )
      );
    },
    [activeSpaceId, activeNoteId]
  );

  const handleDeleteNote = useCallback(() => {
    if (!activeSpaceId || !activeNoteId) return;
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? { ...s, notes: s.notes.filter((n) => n.id !== activeNoteId) }
          : s
      )
    );
    setActiveNoteForSpace(activeSpaceId, undefined);
  }, [activeSpaceId, activeNoteId, setActiveNoteForSpace]);

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <SpaceManager
          spaces={spacesWithUnreadCount.map(
            ({ id, name, messages, unreadCount }) => ({
              id,
              name,
              lastMessage: [...messages]
                .reverse()
                .find((m) => m.type !== "activity")?.content,
              lastMessageSender: [...messages]
                .reverse()
                .find((m) => m.type !== "activity")?.senderName,
              unreadCount,
            })
          )}
          activeSpaceId={activeSpaceId ?? undefined}
          onSelectSpace={handleSelectSpace}
          onSpaceCreated={handleSpaceCreated}
        />
      </div>
      <div className="flex-1">
        {activeSpace ? (
          <ChatArea
            groupName={activeSpace.name}
            messages={activeSpace.messages}
            onSendMessage={handleSendMessage}
            notes={activeSpace.notes}
            activeNoteId={activeNoteId}
            onAddNote={handleAddNote}
            onSelectNote={handleSelectNote}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onReorderNotes={(orderedIds) => {
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
            }}
            draftNote={creatingDraftBySpace[activeSpace.id]}
            onCommitDraft={(draft) => {
              const newNoteId = `note_${Date.now()}`;
              const now = new Date().toISOString();
              const newNote: Note = {
                id: newNoteId,
                title: draft.title,
                blocks: draft.blocks,
                createdAt: now,
                updatedAt: now,
              };
              const { user } = useProfileStore.getState();
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
              setActiveNoteForSpace(activeSpace.id, newNoteId);
              setCreatingDraftBySpace((prev) => ({
                ...prev,
                [activeSpace.id]: undefined,
              }));
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
