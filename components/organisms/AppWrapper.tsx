"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { SpaceManager, ChatArea } from "@/components";
import { useProfileStore } from "@/stores/profileStore";
import {
  createActivityMessage,
  createGenericActivityMessage,
} from "@/utils/messageUtils";
import type {
  User,
  SpaceWithNotes,
  Note,
  NoteBlock,
  Space,
  SpaceMember,
} from "@/types";
import type { AppActions, NoteBlockPayload } from "@/types/app";
import { pusherClient } from "@/lib/pusher-client";

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

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | {
            spaceId: string;
            name?: string;
            description?: string;
            icon?: string;
            activityContent?: string;
          }
        | undefined;
      if (!detail) return;
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === detail.spaceId
            ? {
                ...s,
                name: detail.name ?? s.name,
                description: detail.description ?? s.description,
                icon: detail.icon ?? s.icon,
                messages: detail.activityContent
                  ? [
                      ...s.messages,
                      createGenericActivityMessage(detail.activityContent),
                    ]
                  : s.messages,
              }
            : s
        )
      );
    };
    if (typeof window !== "undefined") {
      window.addEventListener("space-updated", handler as EventListener);
      return () =>
        window.removeEventListener("space-updated", handler as EventListener);
    }
    return () => {};
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { spaceId: string; members: SpaceMember[] }
        | undefined;
      if (!detail) return;
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === detail.spaceId ? { ...s, members: detail.members } : s
        )
      );
    };
    if (typeof window !== "undefined") {
      window.addEventListener("members-updated", handler as EventListener);
      return () =>
        window.removeEventListener("members-updated", handler as EventListener);
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (!pusherClient) {
      console.warn("Pusher client not available. Realtime features disabled.");
      return;
    }

    const globalChannel = pusherClient.subscribe("global");

    const onSpaceCreated = (data: { space: SpaceWithNotes }) => {
      setSpaces((prev) => [data.space, ...prev]);
    };

    const onSpaceDeleted = (data: { spaceId: string }) => {
      setSpaces((prev) => prev.filter((s) => s.id !== data.spaceId));
      if (activeSpaceId === data.spaceId) {
        setActiveSpaceId(null);
      }
    };

    globalChannel.bind("space:created", onSpaceCreated);
    globalChannel.bind("space:deleted", onSpaceDeleted);

    return () => {
      globalChannel.unbind("space:created", onSpaceCreated);
      globalChannel.unbind("space:deleted", onSpaceDeleted);
      pusherClient?.unsubscribe("global");
    };
  }, [activeSpaceId]);

  useEffect(() => {
    if (!activeSpaceId || !pusherClient) return;

    const channel = pusherClient.subscribe(`space-${activeSpaceId}`);

    const onNewMessage = (message: import("@/types").Message) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                messages: s.messages.find((m) => m.id === message.id)
                  ? s.messages
                  : [...s.messages, message],
              }
            : s
        )
      );
    };

    const onNewActivity = (message: import("@/types").Message) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                messages: s.messages.find((m) => m.id === message.id)
                  ? s.messages
                  : [...s.messages, message],
              }
            : s
        )
      );
    };

    const onNoteCreated = (data: { note: Note; spaceId: string }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                notes: s.notes.find((n) => n.id === data.note.id)
                  ? s.notes
                  : [data.note, ...s.notes],
              }
            : s
        )
      );
    };

    const onNoteUpdated = (data: { note: Note; spaceId: string }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                notes: s.notes.map((n) =>
                  n.id === data.note.id ? data.note : n
                ),
              }
            : s
        )
      );
    };

    const onNoteDeleted = (data: { noteId: string; spaceId: string }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? { ...s, notes: s.notes.filter((n) => n.id !== data.noteId) }
            : s
        )
      );
    };

    const onNotesReordered = (data: {
      spaceId: string;
      orderedIds: string[];
    }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                notes: data.orderedIds
                  .map((id: string) => s.notes.find((n) => n.id === id))
                  .filter((n): n is Note => Boolean(n)),
              }
            : s
        )
      );
    };

    const onMemberJoined = (data: { spaceId: string; member: SpaceMember }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                members: [...(s.members || []), data.member],
              }
            : s
        )
      );
    };

    const onMemberLeft = (data: {
      spaceId: string;
      userId: string;
      displayName: string;
    }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                members: (s.members || []).filter(
                  (m) => m.userId !== data.userId
                ),
              }
            : s
        )
      );
    };

    const onSpaceInfoUpdated = (data: {
      spaceId: string;
      name: string;
      description?: string;
      icon?: string;
    }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                name: data.name,
                description: data.description,
                icon: data.icon,
              }
            : s
        )
      );
    };

    const onMemberRoleChanged = (data: {
      spaceId: string;
      targetUserId: string;
      role: string;
      members: SpaceMember[];
    }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                members: data.members,
              }
            : s
        )
      );
    };

    const onMemberRemoved = (data: {
      spaceId: string;
      targetUserId: string;
      members: SpaceMember[];
    }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? {
                ...s,
                members: data.members,
              }
            : s
        )
      );
    };

    channel.bind("message:new", onNewMessage);
    channel.bind("activity:new", onNewActivity);
    channel.bind("note:created", onNoteCreated);
    channel.bind("note:updated", onNoteUpdated);
    channel.bind("note:deleted", onNoteDeleted);
    channel.bind("notes:reordered", onNotesReordered);
    channel.bind("member:joined", onMemberJoined);
    channel.bind("member:left", onMemberLeft);
    channel.bind("space:info-updated", onSpaceInfoUpdated);
    channel.bind("member:role-changed", onMemberRoleChanged);
    channel.bind("member:removed", onMemberRemoved);

    return () => {
      channel.unbind("message:new", onNewMessage);
      channel.unbind("activity:new", onNewActivity);
      channel.unbind("note:created", onNoteCreated);
      channel.unbind("note:updated", onNoteUpdated);
      channel.unbind("note:deleted", onNoteDeleted);
      channel.unbind("notes:reordered", onNotesReordered);
      channel.unbind("member:joined", onMemberJoined);
      channel.unbind("member:left", onMemberLeft);
      channel.unbind("space:info-updated", onSpaceInfoUpdated);
      channel.unbind("member:role-changed", onMemberRoleChanged);
      channel.unbind("member:removed", onMemberRemoved);
      pusherClient?.unsubscribe(`space-${activeSpaceId}`);
    };
  }, [activeSpaceId]);

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

  const spacesWithLastMessage: SpaceWithNotes[] = useMemo(() => {
    return sortedSpaces.map((space) => {
      const derivedLast = [...space.messages]
        .reverse()
        .find((m) => m.type !== "activity");
      return {
        ...space,
        lastMessage: space.lastMessage ?? derivedLast?.content,
        lastMessageSender: space.lastMessageSender ?? derivedLast?.senderName,
      };
    });
  }, [sortedSpaces]);

  const handleSpaceCreated = async (space: SpaceWithNotes) => {
    setSpaces((prev) => [space, ...prev]);
    setActiveSpaceId(space.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSpaceId) return;
    await actions.sendMessage(activeSpaceId, content);
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

      const finalTitle = draft.title.trim() || "Untitled";

      const blocksPayload: NoteBlockPayload[] = draft.blocks.map((block) => ({
        id: block.id || undefined, // Make id optional for validation
        type: block.type,
        content: block.content,
        todoTitle: block.todoTitle,
        items: block.items?.map((item) => ({
          id: item.id || undefined, // Make id optional for validation
          text: item.text,
          done: item.done,
          description: item.description,
        })),
      }));

      console.log("Updating note:", {
        activeNoteId,
        finalTitle,
        blocksPayload,
      });
      await actions.updateNote(activeNoteId, finalTitle, blocksPayload);

      // Send activity message - Pusher will handle the broadcast
      const { user } = useProfileStore.getState();
      const activityMessage = createActivityMessage(
        "edited",
        finalTitle,
        user?.name
      );
      actions
        .sendActivityMessage?.(activeSpaceId, activityMessage.content)
        .catch(() => {});

      // Don't manually update state - let Pusher handle it
      // This prevents conflicts between manual updates and realtime updates
    },
    [activeSpaceId, activeNoteId, actions]
  );

  const handleDeleteNote = useCallback(async () => {
    if (!activeSpaceId || !activeNoteId) return;
    await actions.deleteNote(activeNoteId);

    // Send activity message - Pusher will handle the broadcast
    const { user } = useProfileStore.getState();
    const targetSpace = spaces.find((s) => s.id === activeSpaceId);
    const deletedNote = targetSpace?.notes.find((n) => n.id === activeNoteId);
    const activityMessage = createActivityMessage(
      "deleted",
      deletedNote?.title || "Untitled",
      user?.name
    );
    actions
      .sendActivityMessage?.(activeSpaceId, activityMessage.content)
      .catch(() => {});

    // Clear active note - Pusher will handle the note removal
    setActiveNoteForSpace(activeSpaceId, undefined);
  }, [activeSpaceId, activeNoteId, setActiveNoteForSpace, actions, spaces]);

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <SpaceManager
          spaces={spacesWithLastMessage.map(
            ({ id, name, icon, lastMessage, lastMessageSender }) => ({
              id,
              name,
              icon,
              lastMessage,
              lastMessageSender,
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
              // Call server action - Pusher will handle the realtime update
              actions
                .reorderNotes(activeSpace.id, orderedIds)
                .catch(console.error);
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
              const finalTitle = draft.title.trim() || "Untitled";

              const blocksPayload: NoteBlockPayload[] = draft.blocks.map(
                (block) => ({
                  id: block.id || undefined, // Make id optional for validation
                  type: block.type,
                  content: block.content,
                  todoTitle: block.todoTitle,
                  items: block.items?.map((item) => ({
                    id: item.id || undefined, // Make id optional for validation
                    text: item.text,
                    done: item.done,
                    description: item.description,
                  })),
                })
              );

              console.log("Creating note:", {
                spaceId: activeSpace.id,
                finalTitle,
                blocksPayload,
              });

              actions
                .createNote(activeSpace.id, finalTitle, blocksPayload)
                .then((newNote) => {
                  // Send activity message - Pusher will handle the broadcast
                  const { user } = useProfileStore.getState();
                  const activityMessage = createActivityMessage(
                    "added",
                    finalTitle,
                    user?.name
                  );
                  actions
                    .sendActivityMessage?.(
                      activeSpace.id,
                      activityMessage.content
                    )
                    .catch(() => {});

                  // Set active note and clear draft - Pusher will handle the note addition
                  setActiveNoteForSpace(activeSpace.id, String(newNote.id));
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
