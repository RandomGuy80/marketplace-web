import { LoginForm } from '@/components/auth/LoginForm'
import { ShoppingBag } from 'lucide-react'

export const metadata = { title: 'Sign in — Merkit' }

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your Merkit account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
