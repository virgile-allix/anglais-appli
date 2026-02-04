'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getUserFigurines, type CustomFigurine } from '@/lib/firestore'

const statusLabels: Record<CustomFigurine['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10' },
  generating: { label: 'Generation...', color: 'text-blue-400 bg-blue-400/10' },
  ready: { label: 'Prete', color: 'text-green-400 bg-green-400/10' },
  failed: { label: 'Echouee', color: 'text-red-400 bg-red-400/10' },
}

export default function MyFigurinesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [figurines, setFigurines] = useState<CustomFigurine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-figurines')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getUserFigurines(user.uid)
      .then(setFigurines)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold">
                Mes <span className="text-gold">Figurines</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Retrouvez toutes vos creations personnalisees
              </p>
            </div>
            <Link href="/create-figurine" className="btn-primary text-sm">
              + Nouvelle figurine
            </Link>
          </div>

          {/* Liste vide */}
          {figurines.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-tertiary flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune figurine</h2>
              <p className="text-gray-500 mb-6">Creez votre premiere figurine personnalisee !</p>
              <Link href="/create-figurine" className="btn-primary">
                Creer ma premiere figurine
              </Link>
            </div>
          )}

          {/* Grille de figurines */}
          {figurines.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {figurines.map((figurine) => {
                const status = statusLabels[figurine.status]
                return (
                  <Link
                    key={figurine.id}
                    href={`/my-figurines/view?id=${figurine.id}`}
                    className="card group hover:border-gold/30 transition-all"
                  >
                    {/* Thumbnail / Placeholder */}
                    <div className="aspect-square bg-dark-tertiary flex items-center justify-center overflow-hidden relative">
                      {figurine.thumbnailUrl ? (
                        <img
                          src={figurine.thumbnailUrl}
                          alt={figurine.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          {figurine.status === 'generating' ? (
                            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                          )}
                        </div>
                      )}

                      {/* Status badge */}
                      <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold truncate group-hover:text-gold transition-colors">
                        {figurine.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {figurine.description}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {figurine.createdAt.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
