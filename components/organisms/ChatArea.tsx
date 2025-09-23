import React, { memo, useCallback, useState } from "react";
import { MessageList } from "./MessageList";
import { ChatHeader } from "../molecules/ChatHeader";
import { ChatInput } from "../molecules/ChatInput";
import { NotesPanel } from "./NotesPanel";
import type { Message, Note, NoteBlock } from "@/types";

interface ChatAreaProps {
  groupName?: string;
  groupIcon?: string;
  messages: Message[];
  className?: string;
  onSendMessage?: (content: string) => void;
  notes?: Note[];
  activeNoteId?: string;
  onAddNote?: () => void;
  onSelectNote?: (noteId: string) => void;
  onSaveNote?: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onDeleteNote?: () => void;
  onReorderNotes?: (orderedIds: string[]) => void;
  draftNote?: { title: string; blocks: NoteBlock[] };
  onCommitDraft?: (draft: { title: string; blocks: NoteBlock[] }) => void;
  onCancelDraft?: () => void;
}

const ChatAreaComponent: React.FC<ChatAreaProps> = ({
  groupName,
  groupIcon,
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
}) => {
  const [draft, setDraft] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setDraft("");
  }, [draft, onSendMessage]);
  return (
    <div className="flex h-full ">
      <div className={`flex-1 flex flex-col bg-white ${className}`}>
        {groupName && (
          <ChatHeader
            groupName={groupName}
            groupIcon={groupIcon}
            onToggleNotes={() => setShowNotes((v) => !v)}
          />
        )}
        <MessageList messages={messages} />
        <ChatInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onSend={handleSend}
        />
      </div>
      {showNotes && (
        <div className="w-[40rem] shrink-0 h-full border-l bg-white">
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
        </div>
      )}
    </div>
  );
};

export const ChatArea = memo(ChatAreaComponent);
