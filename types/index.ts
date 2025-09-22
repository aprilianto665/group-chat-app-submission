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
  lastMessage?: string;
  lastMessageSender?: string;
  unreadCount?: number;
  createdAt?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
  username?: string;
  isRead?: boolean;
}

export interface ProfileState {
  currentView: "spaces" | "profile";
  user: User | null;
  setCurrentView: (view: "spaces" | "profile") => void;
  setUser: (user: User | null) => void;
  showProfile: () => void;
  hideProfile: () => void;
}

// Composite types
export type SpaceWithMessages = Omit<Space, "lastMessage"> & {
  messages: Message[];
};
