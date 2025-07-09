import { create } from "zustand";

export const useTranscriptStore = create((set) => ({
  transcript: "",

  setTranscript: (value) => set({ transcript: value }),
}));
