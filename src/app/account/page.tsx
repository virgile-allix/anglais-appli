'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-10">
            Mon <span className="text-gold">Compte</span>
          </h1>

          {/* Informations utilisateur */}
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
                <span className="text-gray-500 text-sm">Inscrit le</span>
                <span className="text-sm">
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Historique commandes (placeholder) */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Historique des commandes
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">
                Aucune commande pour le moment.
              </p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={logout}
            className="btn-outline text-sm"
          >
            Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  )
}
