'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, OrderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import type { User, Order } from '@/types'

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
    if (user === null) router.push('/login')
  }, [user, router])

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<User[]>('/admin/users?limit=50').then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => api.get<Order[]>('/admin/orders?limit=50').then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Users', value: users?.length ?? '—' },
          { label: 'Orders', value: orders?.length ?? '—' },
          { label: 'Revenue', value: orders ? formatPrice(orders.reduce((s, o) => s + o.platform_fee, 0)) : '—' },
          { label: 'Active', value: orders?.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded').length ?? '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Users</h2>
        {loadingUsers ? <Skeleton className="h-40" /> : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">User</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Rating</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users?.map((u) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={u.avatar} name={u.name} size={32} />
                          <div>
                            <p className="font-medium text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'purple' : 'info'}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.rating.toFixed(1)} ({u.review_count})</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(u.created_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Orders table */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Orders</h2>
        {loadingOrders ? <Skeleton className="h-40" /> : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Fee</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders?.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 font-medium">{formatPrice(o.amount)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatPrice(o.platform_fee)}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
