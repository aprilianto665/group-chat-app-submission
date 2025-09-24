import type { Message, Note, SpaceWithNotes } from "./index";

export type NoteBlockItemPayload = {
  id?: string;
  text: string;
  done?: boolean;
  description?: string;
};

export type NoteBlockPayload = {
  id?: string;
  type: "text" | "heading" | "todo";
  content: string;
  todoTitle?: string;
  collapsed?: boolean;
  items?: NoteBlockItemPayload[];
};

export type AppActions = {
  createSpace: (name: string, description?: string) => Promise<SpaceWithNotes>;
  getSpaceDetail: (spaceId: string) => Promise<SpaceWithNotes>;
  joinSpace: (spaceId: string) => Promise<string>;
  leaveSpace?: (spaceId: string) => Promise<{ success: true }>;
  sendMessage: (spaceId: string, content: string) => Promise<Message>;
  listMessages: (spaceId: string) => Promise<Message[]>;
  sendActivityMessage?: (
    spaceId: string,
    htmlContent: string
  ) => Promise<Message>;
  createNote: (
    spaceId: string,
    title: string,
    blocks: NoteBlockPayload[]
  ) => Promise<Note>;
  updateNote: (
    noteId: string,
    title: string,
    blocks: NoteBlockPayload[]
  ) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<boolean>;
  reorderNotes: (spaceId: string, orderedIds: string[]) => Promise<string[]>;
};
