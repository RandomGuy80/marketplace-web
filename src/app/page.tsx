'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react'
import { listingsApi } from '@/lib/api/listings'
import { categoriesApi } from '@/lib/api/users'
import { ListingCard } from '@/components/listing/ListingCard'
import { ListingCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const { data: featured, isLoading } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => listingsApi.search({ limit: 8 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/listings?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Find the perfect<br />
              <span className="text-yellow-300">freelance service</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
              Buy and sell digital services, connect with talented professionals around the world.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-xl mx-auto gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for any service..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-900 bg-white text-sm focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold shadow-none">
                Search
              </Button>
            </form>

            <p className="mt-4 text-sm text-indigo-200">Popular: logo design · web development · video editing</p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-5">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/listings?category_id=${cat.id}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-slate-700 leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Featured Listings</h2>
          <Link href="/listings" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline font-medium">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : (featured?.items ?? []).map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid sm:grid-cols-3 gap-10 text-center">
          {[
            { icon: <ShieldCheck size={32} className="text-indigo-600" />, title: 'Secure Payments', desc: 'Stripe-powered checkout with buyer protection.' },
            { icon: <Zap size={32} className="text-violet-600" />, title: 'Real-time Updates', desc: 'WebSocket notifications on every order event.' },
            { icon: <Star size={32} className="text-amber-500" />, title: 'Verified Reviews', desc: 'Only buyers of delivered orders can review.' },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">{item.icon}</div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to start selling?</h2>
        <p className="text-slate-500 mb-6">Create your seller account and publish your first listing in minutes.</p>
        <Link href="/register">
          <Button size="lg">Get started — it&apos;s free</Button>
        </Link>
      </section>
    </div>
  )
}
