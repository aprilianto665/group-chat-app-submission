export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Space {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  lastMessage?: string;
  lastMessageSender?: string;
  lastMessageTimestamp?: string;
  createdAt?: string;
  members?: SpaceMember[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
  username?: string;
  type?: "text" | "activity";
}

export interface ProfileState {
  currentView: "spaces" | "profile";
  user: User | null;
  setCurrentView: (view: "spaces" | "profile") => void;
  setUser: (user: User | null) => void;
  showProfile: () => void;
  hideProfile: () => void;
}

export type SpaceWithMessages = Space & {
  messages: Message[];
};

export interface NoteBlockItem {
  id: string;
  text: string;
  done: boolean;
  description?: string;
}

export interface NoteBlock {
  id: string;
  type: "text" | "heading" | "todo";
  content: string;
  todoTitle?: string;
  items?: NoteBlockItem[];
}

export interface Note {
  id: string;
  title: string;
  blocks: NoteBlock[];
  updatedAt: string;
  createdAt: string;
}

export type SpaceWithNotes = SpaceWithMessages & {
  notes: Note[];
};

export type Role = "ADMIN" | "MEMBER";

export interface SpaceMemberUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface SpaceMember {
  spaceId: string;
  userId: string;
  user: SpaceMemberUser;
  role: Role;
  joinedAt?: string;
}
