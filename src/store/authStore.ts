import { create } from 'zustand'

export interface UserProdile {
    uid: string
    email: string
    name: string
    image: string
}

interface AuthStore {
    user: UserProdile | null
    loading: boolean
    clearAuth: () => void
    setUser: (user: UserProdile | null) => void
    updateProfile: (data: Partial<UserProdile>) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,
    clearAuth: () => set({ user: null }),
    setUser: (user) => set({ user, loading: false }),
    updateProfile: (data) => set((state) => ({
        user: state.user ? {
            ...state.user, ...data
        } : null
    }))
}))