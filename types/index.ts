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
  unreadCount?: number;
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
  isRead?: boolean;
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

export type SpaceWithMessages = Omit<Space, "lastMessage"> & {
  messages: Message[];
};

export interface NoteBlock {
  id: string;
  type: "text";
  content: string;
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
  id: string;
  user: SpaceMemberUser;
  role: Role;
  joinedAt?: string;
}
