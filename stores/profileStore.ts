import { create } from "zustand";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface ProfileState {
  currentView: "spaces" | "profile";
  user: User | null;
  setCurrentView: (view: "spaces" | "profile") => void;
  setUser: (user: User | null) => void;
  showProfile: () => void;
  hideProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  currentView: "spaces",
  user: null,
  setCurrentView: (view) => set({ currentView: view }),
  setUser: (user) => set({ user }),
  showProfile: () => set({ currentView: "profile" }),
  hideProfile: () => set({ currentView: "spaces" }),
}));
