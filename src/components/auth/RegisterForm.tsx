'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { isAxiosError } from 'axios'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters').max(72, 'Too long'),
  role: z.enum(['buyer', 'seller']),
})
type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const { register: signup } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'buyer' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await signup(data.email, data.password, data.name, data.role)
      toast('Account created!', 'success')
      router.push('/')
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Registration failed' : 'Registration failed'
      toast(msg, 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" placeholder="min 8 characters" error={errors.password?.message} {...register('password')} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">I want to</label>
        <div className="grid grid-cols-2 gap-3">
          {(['buyer', 'seller'] as const).map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" value={r} {...register('role')} className="sr-only peer" />
              <div className="border-2 rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 border-slate-200 text-slate-600 hover:border-slate-300">
                {r === 'buyer' ? '🛍 Buy' : '🏪 Sell'}
              </div>
            </label>
          ))}
        </div>
        {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Create account
      </Button>
      <p className="text-center text-sm text-slate-500">
        Have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  )
}
