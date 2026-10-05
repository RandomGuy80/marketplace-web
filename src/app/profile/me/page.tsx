'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Camera } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/lib/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Stars } from '@/components/ui/Stars'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { isAxiosError } from 'axios'
import { useEffect } from 'react'

export default function MyProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user === null) router.push('/login')
  }, [user, router])

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: { name: user?.name ?? '', bio: user?.bio ?? '' },
  })

  const onSubmit = async (data: { name: string; bio: string }) => {
    try {
      const updated = await usersApi.updateMe({ name: data.name, bio: data.bio || undefined })
      updateUser(updated)
      toast('Profile updated', 'success')
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.error ?? 'Failed' : 'Failed'
      toast(msg, 'error')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast('Max 10MB', 'error'); return }
    setUploading(true)
    try {
      await usersApi.uploadAvatar(file)
      const updated = await usersApi.getMe()
      updateUser(updated)
      toast('Avatar updated', 'success')
    } catch {
      toast('Failed to upload avatar', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (!user) return <div className="max-w-2xl mx-auto px-4 py-8 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-48" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Avatar + stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-6">
        <div className="relative">
          <Avatar src={user.avatar} name={user.name} size={80} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-xl text-slate-900">{user.name}</p>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={user.role === 'seller' ? 'purple' : user.role === 'admin' ? 'danger' : 'info'}>
              {user.role}
            </Badge>
            {user.role === 'seller' && (
              <div className="flex items-center gap-1.5">
                <Stars rating={user.rating} size={13} />
                <span className="text-xs text-slate-500">{user.review_count} reviews</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-900">Edit Profile</h2>
        <Input label="Full name" {...register('name')} />
        <Textarea label="Bio" rows={3} placeholder="Tell buyers about yourself..." {...register('bio')} />
        <Button type="submit" loading={isSubmitting}>Save changes</Button>
      </form>
    </div>
  )
}
