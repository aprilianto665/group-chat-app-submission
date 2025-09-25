"use client";

/**
 * ChatArea Component - Main Chat Interface Hub
 *
 * Central chat interface that orchestrates messages, notes, and space management.
 * Features responsive layout with collapsible side panels for notes and space info.
 * Handles real-time updates, draft management, and user interactions.
 */

import React, { memo, useCallback, useState } from "react";
import {
  MessageList,
  ChatHeader,
  ChatInput,
  NotesPanel,
  SpaceInfoPanel,
} from "@/components";
import type { Message, Note, NoteBlock } from "@/types";

/**
 * Props interface for ChatArea component
 */
interface ChatAreaProps {
  // ===== SPACE INFORMATION =====
  spaceId?: string;
  spaceName?: string;
  spaceIcon?: string;
  spaceDescription?: string;
  spaceMembers?: import("@/types").SpaceMember[];

  // ===== MESSAGE FUNCTIONALITY =====
  messages: Message[];
  className?: string;
  onSendMessage?: (content: string) => void;

  // ===== NOTES FUNCTIONALITY =====
  notes?: Note[];
  activeNoteId?: string;
  onAddNote?: () => void;
  onSelectNote?: (noteId: string) => void;
  onSaveNote?: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onDeleteNote?: () => void;
  onReorderNotes?: (orderedIds: string[]) => void;

  // ===== DRAFT MANAGEMENT =====
  draftNote?: { title: string; blocks: NoteBlock[] };
  onCommitDraft?: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onCancelDraft?: () => void;

  // ===== SPACE MANAGEMENT =====
  onLeaveSpace?: () => void;
}

/**
 * ChatArea Component Implementation
 *
 * Renders the main chat interface with message display, notes panel, and space information.
 * Manages panel visibility, message drafts, and coordinates between different UI sections.
 *
 * @param spaceId - Optional space identifier
 * @param spaceName - Space display name
 * @param spaceIcon - Optional space icon URL
 * @param spaceDescription - Optional space description
 * @param spaceMembers - Array of space members
 * @param messages - Array of messages to display
 * @param className - Additional CSS classes
 * @param onSendMessage - Handler for sending new messages
 * @param notes - Array of notes for the space
 * @param activeNoteId - Currently selected note ID
 * @param onAddNote - Handler for adding new notes
 * @param onSelectNote - Handler for selecting notes
 * @param onSaveNote - Handler for saving note changes
 * @param onDeleteNote - Handler for deleting notes
 * @param onReorderNotes - Handler for reordering notes
 * @param draftNote - Current note draft data
 * @param onCommitDraft - Handler for committing note drafts
 * @param onCancelDraft - Handler for canceling note drafts
 * @param onLeaveSpace - Handler for leaving the space
 */
const ChatAreaComponent: React.FC<ChatAreaProps> = ({
  spaceId,
  spaceName,
  spaceIcon,
  spaceDescription,
  spaceMembers,
  messages,
  className = "",
  onSendMessage,
  notes = [],
  activeNoteId,
  onAddNote,
  onSelectNote,
  onSaveNote,
  onDeleteNote,
  onReorderNotes,
  draftNote,
  onCommitDraft,
  onCancelDraft,
  onLeaveSpace,
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Local draft state for message input
   * Tracks the current message being typed
   */
  const [draft, setDraft] = useState("");

  /**
   * Controls visibility of the notes panel
   * When true, shows the notes editing interface
   */
  const [showNotes, setShowNotes] = useState(false);

  /**
   * Controls visibility of the space info panel
   * When true, shows space details and member management
   */
  const [showSpaceInfo, setShowSpaceInfo] = useState(false);

  // ===== EVENT HANDLERS =====

  /**
   * Handles sending a new message
   * Trims whitespace and calls the onSendMessage callback
   */
  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setDraft("");
  }, [draft, onSendMessage]);
  return (
    <div className="flex h-full ">
      <div className={`flex-1 flex flex-col bg-white ${className}`}>
        {spaceName && (
          <ChatHeader
            spaceName={spaceName}
            spaceIcon={spaceIcon}
            onToggleNotes={() => {
              setShowNotes((v) => {
                const next = !v;
                if (next) setShowSpaceInfo(false);
                return next;
              });
            }}
            onOpenSpaceInfo={() => {
              setShowSpaceInfo(true);
              setShowNotes(false);
            }}
          />
        )}
        <MessageList messages={messages} />
        <ChatInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onSend={handleSend}
        />
      </div>
      {(showNotes || showSpaceInfo) && (
        <div
          className={`${
            showSpaceInfo ? "w-[26rem]" : "w-[40rem]"
          } shrink-0 h-full border-l bg-white`}
        >
          {showSpaceInfo ? (
            <SpaceInfoPanel
              spaceId={spaceId}
              name={spaceName || ""}
              icon={spaceIcon}
              description={spaceDescription}
              members={spaceMembers}
              onClose={() => setShowSpaceInfo(false)}
              onLeaveSpace={() => {
                onLeaveSpace?.();
                setShowSpaceInfo(false);
              }}
            />
          ) : (
            <NotesPanel
              notes={notes}
              activeNoteId={activeNoteId}
              onAddNote={() => onAddNote?.()}
              onSelectNote={(id) => onSelectNote?.(id)}
              onSave={(draft) => onSaveNote?.(draft)}
              onDeleteNote={onDeleteNote || (() => {})}
              onReorderNotes={(ids) => onReorderNotes?.(ids)}
              draftNote={draftNote}
              onCommitDraft={onCommitDraft}
              onCancelDraft={onCancelDraft}
            />
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Memoized ChatArea component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 * Essential for maintaining smooth chat experience
 */
export const ChatArea = memo(ChatAreaComponent);
