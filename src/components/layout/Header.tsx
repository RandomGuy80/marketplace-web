'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Plus, User, LogOut, Shield, Package } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { useAuth } from '@/lib/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function Header() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = [
    { href: '/listings', label: 'Browse' },
    ...(user ? [{ href: '/orders', label: 'Orders' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <ShoppingBag size={22} />
          <span>Merkit</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === 'seller' || user.role === 'admin') && (
                <Link href="/listings/new">
                  <Button size="sm" variant="outline">
                    <Plus size={15} /> New Listing
                  </Button>
                </Link>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Avatar src={user.avatar} name={user.name} size={32} />
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-1 z-50"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link
                      href="/profile/me"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Package size={15} /> Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Shield size={15} /> Admin
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => { setMenuOpen(false); logout() }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
