import { create } from "zustand";

export const useThemeStore = create((set) => ({
  // get installed theme from previous access
  theme: localStorage.getItem("chat-theme") || "coffee",
  // set method
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));