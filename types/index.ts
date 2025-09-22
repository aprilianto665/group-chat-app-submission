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
  unreadCount?: number;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent?: boolean;
  senderName?: string;
}

export interface ProfileState {
  currentView: "spaces" | "profile";
  user: User | null;
  setCurrentView: (view: "spaces" | "profile") => void;
  setUser: (user: User | null) => void;
  showProfile: () => void;
  hideProfile: () => void;
}
