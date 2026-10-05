import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <ShoppingBag size={20} />
          <span>Merkit</span>
        </Link>
        <p className="text-sm text-slate-400">© 2026 Merkit. Portfolio project.</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <Link href="/listings" className="hover:text-slate-800 transition-colors">Browse</Link>
          <Link href="/register" className="hover:text-slate-800 transition-colors">Sell</Link>
        </div>
      </div>
    </footer>
  )
}
