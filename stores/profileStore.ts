import { create } from "zustand";
import type { User, ProfileState } from "../types";

export const useProfileStore = create<ProfileState>((set) => ({
  currentView: "spaces",
  user: null,
  setCurrentView: (view) => set({ currentView: view }),
  setUser: (user) => set({ user }),
  showProfile: () => set({ currentView: "profile" }),
  hideProfile: () => set({ currentView: "spaces" }),
}));
