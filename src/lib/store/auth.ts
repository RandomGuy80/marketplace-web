import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', token)
    }
    set({ user, accessToken: token })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token')
    }
    set({ user: null, accessToken: null })
  },

  updateUser: (user) => set({ user }),
}))
