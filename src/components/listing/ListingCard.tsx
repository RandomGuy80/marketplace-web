'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, MapPin } from 'lucide-react'
import type { Listing } from '@/types'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { ListingStatusBadge } from '@/components/ui/Badge'

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const thumb = listing.images?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
    >
      <Link href={`/listings/${listing.id}`} className="block group">
        <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-violet-50">
            {thumb ? (
              <Image
                src={getImageUrl(thumb)}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl text-slate-300">
                🖼
              </div>
            )}
            <div className="absolute top-3 right-3">
              <ListingStatusBadge status={listing.status} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {listing.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{listing.description}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-600">
                {formatPrice(listing.price, listing.currency)}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {listing.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {listing.views}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
