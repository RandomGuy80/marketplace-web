'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ordersApi } from '@/lib/api/orders'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPrice, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function OrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user === null) router.push('/login')
  }, [user, router])

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
    enabled: !!user,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}

      {!isLoading && orders?.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-medium">No orders yet</p>
          <Link href="/listings" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">Browse listings</Link>
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/orders/${order.id}`} className="block bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 mb-1">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.id === order.buyer_id ? '🛍 Bought' : '📤 Sold'}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-slate-900">{formatPrice(order.amount)}</span>
                  <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
