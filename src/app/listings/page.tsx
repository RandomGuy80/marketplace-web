'use client'

import { Suspense, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { listingsApi } from '@/lib/api/listings'
import { categoriesApi } from '@/lib/api/users'
import { ListingCard } from '@/components/listing/ListingCard'
import { ListingCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import type { Listing, ListingsFilter } from '@/types'
import { useSearchParams, useRouter } from 'next/navigation'

function ListingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filter, setFilter] = useState<ListingsFilter>({
    q: searchParams.get('q') ?? '',
    limit: 20,
  })
  const [input, setInput] = useState(filter.q ?? '')
  const [cursor, setCursor] = useState<string | undefined>()
  const [allItems, setAllItems] = useState<Listing[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filter, cursor],
    queryFn: () => listingsApi.search({ ...filter, cursor }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  useEffect(() => {
    if (data) {
      const items = data.items ?? []
      if (!cursor) setAllItems(items)
      else setAllItems((prev) => [...prev, ...items])
    }
  }, [data, cursor])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCursor(undefined)
    setAllItems([])
    setFilter((f) => ({ ...f, q: input }))
    router.push(`/listings?q=${encodeURIComponent(input)}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" size="md">Search</Button>
      </form>

      {categories && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => { setCursor(undefined); setAllItems([]); setFilter((f) => ({ ...f, category_id: undefined })) }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!filter.category_id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCursor(undefined); setAllItems([]); setFilter((f) => ({ ...f, category_id: cat.id })) }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter.category_id === cat.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && !allItems.length
          ? Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)
          : allItems.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
      </div>

      {data?.next_cursor && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setCursor(data.next_cursor)}>
            Load more
          </Button>
        </div>
      )}

      {!isLoading && allItems.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No listings found</p>
        </div>
      )}
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    }>
      <ListingsContent />
    </Suspense>
  )
}
