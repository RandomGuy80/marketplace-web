'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuthStore } from '@/lib/store/auth'
import { usersApi } from '@/lib/api/users'

function AuthHydrator() {
  const { setAuth, accessToken } = useAuthStore()

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    if (!token || accessToken) return
    usersApi.getMe().then((user) => setAuth(user, token)).catch(() => {})
  }, [setAuth, accessToken])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <AuthHydrator />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  )
}
