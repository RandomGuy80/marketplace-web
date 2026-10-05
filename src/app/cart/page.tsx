'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { ordersApi } from '@/lib/api/orders'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem } = useCartStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const [buying, setBuying] = useState<string | null>(null)

  const total = items.reduce((sum, { listing }) => sum + listing.price, 0)
  const isDemo = (id: string) => id.startsWith('demo-')

  const handleCheckout = async (listingId: string) => {
    if (!user) { router.push('/login'); return }
    setBuying(listingId)
    try {
      const order = await ordersApi.create(listingId)
      const { checkout_url } = await ordersApi.checkout(order.id)
      window.location.href = checkout_url
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Checkout failed' : 'Checkout failed'
      toast(msg, 'error')
      setBuying(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mx-auto">
          <PackageOpen size={28} className="text-zinc-600" />
        </div>
        <p className="text-zinc-400 font-medium">Your cart is empty</p>
        <Link href="/listings">
          <Button variant="outline" size="sm" className="mt-2">
            Browse listings <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Cart <span className="text-zinc-600 font-normal text-base ml-1">({items.length})</span>
        </h1>
        <Link href="/listings" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
          Continue shopping <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map(({ listing }) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-2xl p-4"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-[#222]">
                {listing.images?.[0] ? (
                  <Image
                    src={getImageUrl(listing.images[0])}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={!listing.images[0].startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xl">🖼</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/listings/${listing.id}`} className="text-sm font-medium text-white hover:text-zinc-300 transition-colors line-clamp-1">
                  {listing.title}
                </Link>
                {listing.location && (
                  <p className="text-xs text-zinc-600 mt-0.5">{listing.location}</p>
                )}
                {isDemo(listing.id) && (
                  <span className="text-[10px] text-zinc-700 uppercase tracking-wider">demo item</span>
                )}
              </div>

              {/* Price + actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-bold text-white text-sm">{formatPrice(listing.price, listing.currency)}</span>

                {!isDemo(listing.id) ? (
                  <Button
                    size="sm"
                    onClick={() => handleCheckout(listing.id)}
                    loading={buying === listing.id}
                  >
                    Buy
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toast('Demo item — connect the backend to purchase real listings', 'info')}
                  >
                    Buy
                  </Button>
                )}

                <button
                  onClick={() => removeItem(listing.id)}
                  className="text-zinc-700 hover:text-red-400 transition-colors cursor-none"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-[#111] border border-[#222] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Subtotal</span>
          <span className="font-bold text-white text-lg">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-zinc-600">Each item is checked out separately. Click Buy next to the item to proceed.</p>
      </div>
    </div>
  )
}
