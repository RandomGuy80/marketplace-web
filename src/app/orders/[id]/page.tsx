'use client'

import { use } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Truck, Package, XCircle } from 'lucide-react'
import { ordersApi } from '@/lib/api/orders'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/lib/store/auth'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'
import { useState } from 'react'
import { isAxiosError } from 'axios'

const STATUS_STEPS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [paying, setPaying] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
  })

  const updateStatus = async (status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(id, status)
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast(`Status updated to ${status}`, 'success')
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Failed' : 'Failed'
      toast(msg, 'error')
    }
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const { checkout_url } = await ordersApi.checkout(id)
      window.location.href = checkout_url
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Failed' : 'Failed'
      toast(msg, 'error')
      setPaying(false)
    }
  }

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 space-y-4"><Skeleton className="h-48" /><Skeleton className="h-24" /></div>
  if (!order) return <div className="text-center py-20 text-slate-400">Order not found</div>

  const isBuyer = user?.id === order.buyer_id
  const isSeller = user?.id === order.seller_id
  const isAdmin = user?.role === 'admin'

  const stepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Order ID</p>
              <p className="font-mono text-sm text-slate-700">{order.id}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Amount</p>
              <p className="font-bold text-xl text-slate-900">{formatPrice(order.amount)}</p>
            </div>
            <div>
              <p className="text-slate-400">Platform fee</p>
              <p className="font-medium text-slate-600">{formatPrice(order.platform_fee)}</p>
            </div>
            <div>
              <p className="text-slate-400">Created</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-slate-400">Updated</p>
              <p className="font-medium">{formatDate(order.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Progress</h2>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center gap-1 ${i <= stepIdx ? 'text-indigo-600' : 'text-slate-300'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= stepIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
                      {i < stepIdx ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className="text-xs capitalize whitespace-nowrap">{step}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-slate-900">Actions</h2>

          {isBuyer && order.status === 'pending' && (
            <Button className="w-full" size="lg" onClick={handlePay} loading={paying}>
              <CreditCard size={18} /> Pay Now
            </Button>
          )}
          {isSeller && order.status === 'paid' && (
            <Button className="w-full" variant="secondary" onClick={() => updateStatus('shipped')}>
              <Truck size={16} /> Mark as Shipped
            </Button>
          )}
          {(isBuyer || isSeller) && order.status === 'shipped' && (
            <Button className="w-full" variant="secondary" onClick={() => updateStatus('delivered')}>
              <Package size={16} /> Mark as Delivered
            </Button>
          )}
          {(isBuyer || isSeller) && order.status === 'pending' && (
            <Button variant="outline" className="w-full" onClick={() => updateStatus('cancelled')}>
              <XCircle size={16} /> Cancel Order
            </Button>
          )}
          {isAdmin && order.status === 'delivered' && (
            <Button variant="danger" className="w-full" onClick={() => updateStatus('refunded')}>
              Issue Refund
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
