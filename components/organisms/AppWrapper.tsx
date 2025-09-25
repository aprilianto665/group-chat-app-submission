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

/**
 * AppWrapper Component - Main Application State Manager
 *
 * Core component orchestrating application state and real-time functionality.
 * Manages user interactions, data flow, and Pusher WebSocket communication.
 */
export const AppWrapper: React.FC<{
  user: User;
  initialSpaces: SpaceWithNotes[];
  actions: AppActions;
}> = ({ user, initialSpaces, actions }) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Profile store for user information management
   */
  const { setUser } = useProfileStore();

  /**
   * Currently active space ID - determines which space is being viewed
   */
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  /**
   * All spaces the user has access to with their notes and messages
   * Updated in real-time through Pusher events
   */
  const [spaces, setSpaces] = useState<SpaceWithNotes[]>(() => initialSpaces);

  /**
   * Tracks which note is active for each space
   * Key: spaceId, Value: noteId or undefined
   */
  const [activeNoteIdBySpace, setActiveNoteIdBySpace] = useState<
    Record<string, string | undefined>
  >({});

  /**
   * Draft notes being created for each space
   * Key: spaceId, Value: draft note data or undefined
   */
  const [creatingDraftBySpace, setCreatingDraftBySpace] = useState<
    Record<string, { title: string; blocks: NoteBlock[] } | undefined>
  >({});

  /**
   * Initializes user profile in the global store
   * Sets user information from props into the Zustand profile store
   */
  useEffect(() => {
    setUser({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? "/avatar_default.jpg",
    });
  }, [user, setUser]);

  // ===== COMPUTED VALUES =====

  /**
   * Currently active space object derived from activeSpaceId
   * Returns undefined if no space is selected
   */
  const activeSpace = useMemo(
    () =>
      activeSpaceId ? spaces.find((s) => s.id === activeSpaceId) : undefined,
    [activeSpaceId, spaces]
  );

  /**
   * Listens for custom space-updated events from other components
   * Updates space information and adds activity messages when space is modified
   */
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

  /**
   * Listens for custom members-updated events from other components
   * Updates member lists when members are added, removed, or roles changed
   */
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

  /**
   * Sets up global Pusher channel for space-level events
   * Handles space creation and deletion events across the application
   */
  useEffect(() => {
    if (!pusherClient) {
      console.warn("Pusher client not available. Realtime features disabled.");
      return;
    }

    const globalChannel = pusherClient.subscribe("global");

    /**
     * Handles space creation events from global channel
     * Adds new spaces to the spaces list, avoiding duplicates
     * @param data - Object containing the new space data
     */
    const onSpaceCreated = (data: { space: SpaceWithNotes }) => {
      setSpaces((prev) => {
        const exists = prev.find((s) => s.id === data.space.id);
        if (exists) return prev;
        return [data.space, ...prev];
      });
    };

    /**
     * Handles space deletion events from global channel
     * Removes deleted spaces and clears active space if needed
     * @param data - Object containing the space ID to delete
     */
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

    /**
     * Handles new message events from Pusher
     * Adds new messages to the active space's message list
     * @param message - The new message received
     */
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

    /**
     * Handles new activity message events from Pusher
     * Adds activity messages to the active space's message list
     * @param message - The new activity message received
     */
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

    /**
     * Handles note creation events from Pusher
     * Adds new notes to the active space's note list
     * @param data - Object containing the new note and space ID
     */
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

    /**
     * Handles note update events from Pusher
     * Updates existing notes in the active space's note list
     * @param data - Object containing the updated note and space ID
     */
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

    /**
     * Handles note deletion events from Pusher
     * Removes deleted notes from the active space's note list
     * @param data - Object containing the note ID and space ID
     */
    const onNoteDeleted = (data: { noteId: string; spaceId: string }) => {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === activeSpaceId
            ? { ...s, notes: s.notes.filter((n) => n.id !== data.noteId) }
            : s
        )
      );
    };

    /**
     * Handles note reordering events from Pusher
     * Reorders notes in the active space based on the provided order
     * @param data - Object containing space ID and ordered note IDs
     */
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

    /**
     * Handles member join events from Pusher
     * Adds new members to the active space's member list
     * @param data - Object containing space ID and new member data
     */
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

    /**
     * Handles member leave events from Pusher
     * Removes members from the active space's member list
     * @param data - Object containing space ID, user ID, and display name
     */
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

    /**
     * Handles space info update events from Pusher
     * Updates space information (name, description, icon) in the active space
     * @param data - Object containing space ID and updated space information
     */
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

    /**
     * Handles member role change events from Pusher
     * Updates member roles in the active space's member list
     * @param data - Object containing space ID, target user ID, new role, and updated members list
     */
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

    /**
     * Handles member removal events from Pusher
     * Updates member list after a member is removed from the active space
     * @param data - Object containing space ID, target user ID, and updated members list
     */
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

  /**
   * Spaces sorted by most recent activity (last message or creation time)
   * Used for displaying spaces in chronological order in the sidebar
   */
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

  /**
   * Spaces with derived last message information for display
   * Extracts the most recent non-activity message for each space
   */
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

  // ===== EVENT HANDLERS =====

  /**
   * Handles space creation - adds new space to list and sets it as active
   * @param space - The newly created space with notes and messages
   */
  const handleSpaceCreated = async (space: SpaceWithNotes) => {
    setSpaces((prev) => {
      // Check if space already exists to avoid duplicates
      const exists = prev.find((s) => s.id === space.id);
      if (exists) return prev;
      return [space, ...prev];
    });
    setActiveSpaceId(space.id);
  };

  /**
   * Handles sending a new message to the active space
   * @param content - The message content to send
   */
  const handleSendMessage = async (content: string) => {
    if (!activeSpaceId) return;
    await actions.sendMessage(activeSpaceId, content);
  };

  /**
   * Handles space selection - fetches detailed space data and sets as active
   * @param spaceId - The ID of the space to select
   */
  const handleSelectSpace = async (spaceId: string) => {
    setActiveSpaceId(spaceId);
    const detail = await actions.getSpaceDetail(spaceId);
    setSpaces((prev) => {
      const exists = prev.find((s) => s.id === spaceId);
      if (exists) return prev.map((s) => (s.id === spaceId ? detail : s));
      return [detail, ...prev];
    });
  };

  /**
   * Currently active note ID for the active space
   */
  const activeNoteId = activeSpaceId
    ? activeNoteIdBySpace[activeSpaceId]
    : undefined;

  /**
   * Sets the active note for a specific space
   * @param spaceId - The space ID
   * @param noteId - The note ID to set as active (undefined to clear)
   */
  const setActiveNoteForSpace = useCallback(
    (spaceId: string, noteId?: string) => {
      setActiveNoteIdBySpace((prev) => ({ ...prev, [spaceId]: noteId }));
    },
    []
  );

  /**
   * Initiates note creation by setting up a draft note
   * Creates a new draft with default title and empty text block
   */
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

  /**
   * Handles note selection - sets the selected note as active
   * @param noteId - The ID of the note to select
   */
  const handleSelectNote = useCallback(
    (noteId: string) => {
      if (!activeSpaceId) return;
      setActiveNoteForSpace(activeSpaceId, noteId);
    },
    [activeSpaceId, setActiveNoteForSpace]
  );

  /**
   * Handles note saving - updates existing note with new content
   * Sends activity message and lets Pusher handle real-time updates
   * @param draft - The note draft containing title and blocks
   */
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

  /**
   * Handles note deletion - removes note and sends activity message
   * Clears active note selection and lets Pusher handle real-time updates
   */
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
