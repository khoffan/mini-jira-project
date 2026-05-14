import { create } from 'zustand'

export interface BoardState {
    board: { id: string; title: string, slug: string } | null;
    setBoard: (board: { id: string; title: string, slug: string } | null) => void;
}

export const useBoardStore = create<BoardState>()((set) => ({
    board: null,
    setBoard: (board) => set({ board }),
}));