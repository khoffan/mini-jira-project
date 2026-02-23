import { create } from "zustand";

export interface ProjectState {
    project: { id: string; title: string } | null;
    setProject: (project: { id: string; title: string } | null) => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
    project: null,
    setProject: (project) => set({ project }),
}));
