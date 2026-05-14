import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ViewState {
    view: 'list' | 'canvas';
    setView: (view: 'list' | 'canvas') => void;
}


export const useViewStore = create<ViewState>()(persist((set) => ({
    view: 'list',
    setView: (view: 'list' | 'canvas') => set({ view }),
}), {
    name: 'view-storage',
}));