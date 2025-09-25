/**
 * Profile Store (Zustand)
 *
 * Global state management for user profile and UI state.
 * Manages:
 * - Current view state (spaces/profile)
 * - User profile information
 * - View navigation methods
 *
 * Uses Zustand for lightweight, type-safe state management.
 */

import { create } from "zustand";
import type { ProfileState } from "../types";

/**
 * Profile store instance for global state management
 * Provides methods to manage user profile and view state
 */
export const useProfileStore = create<ProfileState>((set) => ({
  currentView: "spaces",
  user: null,
  setCurrentView: (view) => set({ currentView: view }),
  setUser: (user) => set({ user }),
  showProfile: () => set({ currentView: "profile" }),
  hideProfile: () => set({ currentView: "spaces" }),
}));
