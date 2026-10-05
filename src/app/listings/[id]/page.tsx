'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Eye, Calendar, Tag, ShoppingCart, Pencil, Trash2 } from 'lucide-react'
import { listingsApi } from '@/lib/api/listings'
import { ordersApi } from '@/lib/api/orders'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/lib/store/auth'
import { Button } from '@/components/ui/Button'
import { Badge, ListingStatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Stars } from '@/components/ui/Stars'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import { useState } from 'react'
import { isAxiosError } from 'axios'

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const [buying, setBuying] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
  })

  const { data: seller } = useQuery({
    queryKey: ['user', listing?.seller_id],
    queryFn: () => usersApi.getPublic(listing!.seller_id),
    enabled: !!listing?.seller_id,
  })

  const handleBuy = async () => {
    if (!user) { router.push('/login'); return }
    setBuying(true)
    try {
      const order = await ordersApi.create(id)
      const { checkout_url } = await ordersApi.checkout(order.id)
      window.location.href = checkout_url
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Failed' : 'Failed'
      toast(msg, 'error')
    } finally {
      setBuying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    try {
      await listingsApi.delete(id)
      toast('Listing deleted', 'success')
      router.push('/listings')
    } catch {
      toast('Failed to delete', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <Skeleton className="h-96" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    )
  }

  if (!listing) return <div className="text-center py-20 text-slate-400">Listing not found</div>

  const images = listing.images?.length ? listing.images : []
  const isOwner = user?.id === listing.seller_id
  const isAdmin = user?.role === 'admin'
  const canBuy = user && !isOwner && listing.status === 'active'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
            {images[imgIdx] ? (
              <Image src={getImageUrl(images[imgIdx])} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl text-slate-300">🖼</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-indigo-600' : 'border-transparent'}`}>
                  <Image src={getImageUrl(img)} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
            <ListingStatusBadge status={listing.status} />
          </div>

          <div className="text-3xl font-bold text-indigo-600">
            {formatPrice(listing.price, listing.currency)}
          </div>

          <p className="text-slate-600 leading-relaxed">{listing.description}</p>

          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            {listing.location && <span className="flex items-center gap-1"><MapPin size={14} />{listing.location}</span>}
            <span className="flex items-center gap-1"><Eye size={14} />{listing.views} views</span>
            <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(listing.created_at)}</span>
          </div>

          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <Badge key={tag} variant="info"><Tag size={10} className="mr-1" />{tag}</Badge>
              ))}
            </div>
          )}

          {/* Seller */}
          {seller && (
            <Link href={`/profile/${seller.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <Avatar src={seller.avatar} name={seller.name} size={44} />
              <div>
                <p className="font-medium text-slate-900">{seller.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={seller.rating} size={13} />
                  <span className="text-xs text-slate-500">{seller.review_count} reviews</span>
                </div>
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            {canBuy && (
              <Button size="lg" className="flex-1" onClick={handleBuy} loading={buying}>
                <ShoppingCart size={18} /> Buy Now
              </Button>
            )}
            {isOwner && (
              <Link href={`/listings/${id}/edit`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  <Pencil size={16} /> Edit
                </Button>
              </Link>
            )}
            {(isOwner || isAdmin) && (
              <Button variant="danger" size="lg" onClick={handleDelete}>
                <Trash2 size={16} />
              </Button>
            )}
            {!user && listing.status === 'active' && (
              <Link href="/login" className="flex-1">
                <Button size="lg" className="w-full">Sign in to Buy</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
