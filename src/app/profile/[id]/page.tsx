'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usersApi } from '@/lib/api/users'
import { listingsApi } from '@/lib/api/listings'
import { Avatar } from '@/components/ui/Avatar'
import { Stars } from '@/components/ui/Stars'
import { Badge } from '@/components/ui/Badge'
import { ListingCard } from '@/components/listing/ListingCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getPublic(id),
  })

  const { data: listings } = useQuery({
    queryKey: ['listings', 'seller', id],
    queryFn: () => listingsApi.search({ seller_id: id, limit: 12 }),
    enabled: !!user,
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => usersApi.getReviews(id),
    enabled: !!user,
  })

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-48" /></div>
  if (!user) return <div className="text-center py-20 text-slate-400">User not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-6"
      >
        <Avatar src={user.avatar} name={user.name} size={80} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <Badge variant={user.role === 'seller' ? 'purple' : 'info'}>{user.role}</Badge>
          </div>
          {user.bio && <p className="text-slate-600 mt-2">{user.bio}</p>}
          <div className="flex items-center gap-4 mt-3">
            {user.role === 'seller' && (
              <>
                <div className="flex items-center gap-2">
                  <Stars rating={user.rating} />
                  <span className="text-sm font-medium text-slate-700">{user.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-slate-500">{user.review_count} reviews</span>
              </>
            )}
            <span className="text-sm text-slate-400">Member since {formatDate(user.created_at)}</span>
          </div>
        </div>
      </motion.div>

      {/* Listings */}
      {listings && listings.items.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.items.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Reviews</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={r.reviewer?.avatar} name={r.reviewer?.name ?? '?'} size={36} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.reviewer?.name}</p>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <span className="ml-auto text-xs text-slate-400">{formatDate(r.created_at)}</span>
                </div>
                {r.body && <p className="text-sm text-slate-600">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
