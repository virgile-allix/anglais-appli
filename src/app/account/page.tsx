'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function AccountPage() {
  const { user, profile, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-10">
            <h1 className="text-3xl font-bold">
              Mon <span className="text-gold">Compte</span>
            </h1>
            {profile?.isAdmin && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-gold">
                ADMIN
              </span>
            )}
          </div>

          {/* Informations */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">UID</span>
                <span className="text-xs text-gray-600 font-mono">{user.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Rôle</span>
                <span className="text-sm">{profile?.isAdmin ? 'Administrateur' : 'Client'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Inscrit le</span>
                <span className="text-sm">
                  {profile?.createdAt
                    ? profile.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Raccourcis */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Raccourcis
            </h2>
            <div className="flex flex-col gap-3">
              <Link href="/orders" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <span className="text-sm">Mes commandes</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/shop" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <span className="text-sm">Voir la boutique</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <button onClick={logout} className="btn-outline text-sm">
            Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  )
}
