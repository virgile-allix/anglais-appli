'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getFigurineById, updateFigurine, deleteFigurine, type CustomFigurine } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'
import ProductViewer3D from '@/components/ProductViewer3D'

const statusLabels: Record<CustomFigurine['status'], { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente de generation', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  generating: { label: 'Generation en cours...', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ready: { label: 'Figurine prete !', color: 'text-green-400', bg: 'bg-green-400/10' },
  failed: { label: 'Generation echouee', color: 'text-red-400', bg: 'bg-red-400/10' },
}

export default function FigurineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const figurineId = params.id as string

  const [figurine, setFigurine] = useState<CustomFigurine | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [pollingActive, setPollingActive] = useState(false)

  // Charger la figurine
  useEffect(() => {
    if (!figurineId) return
    getFigurineById(figurineId)
      .then((f) => {
        if (!f) {
          router.push('/my-figurines')
          return
        }
        setFigurine(f)
        // Si en cours de generation, activer le polling
        if (f.status === 'pending' || f.status === 'generating') {
          setPollingActive(true)
        }
      })
      .finally(() => setLoading(false))
  }, [figurineId, router])

  // Polling du statut Meshy via l'API Express
  const checkMeshyStatus = useCallback(async () => {
    if (!figurine?.meshyTaskId) return

    try {
      const data = await apiFetch<{
        status: string
        progress: number
        modelUrl: string | null
        thumbnailUrl: string | null
      }>(`/meshy/status/${figurine.meshyTaskId}`)

      if (data.status === 'SUCCEEDED' && data.modelUrl) {
        const modelUrl = data.modelUrl || ''
        const thumbnailUrl = data.thumbnailUrl || ''
        await updateFigurine(figurine.id, {
          status: 'ready',
          modelUrl,
          thumbnailUrl,
        })
        setFigurine((prev) => prev ? {
          ...prev,
          status: 'ready',
          modelUrl,
          thumbnailUrl,
        } : null)
        setPollingActive(false)
      } else if (data.status === 'FAILED') {
        await updateFigurine(figurine.id, { status: 'failed' })
        setFigurine((prev) => prev ? { ...prev, status: 'failed' } : null)
        setPollingActive(false)
      } else if (data.status === 'IN_PROGRESS') {
        await updateFigurine(figurine.id, { status: 'generating' })
        setFigurine((prev) => prev ? { ...prev, status: 'generating' } : null)
      }
    } catch (error) {
      console.error('Error checking Meshy status:', error)
    }
  }, [figurine])

  // Polling interval
  useEffect(() => {
    if (!pollingActive || !figurine?.meshyTaskId) return

    const interval = setInterval(checkMeshyStatus, 10000) // Toutes les 10 secondes
    checkMeshyStatus() // Check immédiat

    return () => clearInterval(interval)
  }, [pollingActive, figurine?.meshyTaskId, checkMeshyStatus])

  // Verifier l'authentification
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Supprimer la figurine
  const handleDelete = async () => {
    if (!figurine || !confirm('Etes-vous sur de vouloir supprimer cette figurine ?')) return
    setDeleting(true)
    try {
      await deleteFigurine(figurine.id)
      router.push('/my-figurines')
    } catch {
      alert('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !figurine) return null

  // Verifier que la figurine appartient a l'utilisateur
  if (figurine.uid !== user.uid) {
    router.push('/my-figurines')
    return null
  }

  const status = statusLabels[figurine.status]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/my-figurines" className="hover:text-gold transition-colors">Mes figurines</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{figurine.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: 3D Viewer */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square">
              {figurine.status === 'ready' && figurine.modelUrl ? (
                <ProductViewer3D modelUrl={figurine.modelUrl} className="h-full" />
              ) : figurine.status === 'generating' || figurine.status === 'pending' ? (
                <div className="h-full bg-dark-tertiary rounded-2xl flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400">Generation en cours...</p>
                  <p className="text-xs text-gray-600">Cela peut prendre plusieurs minutes</p>
                </div>
              ) : (
                <div className="h-full bg-dark-tertiary rounded-2xl flex flex-col items-center justify-center gap-4">
                  <svg className="w-16 h-16 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-400">La generation a echoue</p>
                  <Link href="/create-figurine" className="text-sm text-gold hover:text-gold-light transition-colors">
                    Reessayer avec une nouvelle figurine
                  </Link>
                </div>
              )}
            </div>

            {/* Controles 3D info */}
            {figurine.status === 'ready' && figurine.modelUrl && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Cliquez et faites glisser pour faire pivoter - Scrollez pour zoomer
              </p>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-4 ${status.bg}`}>
              {(figurine.status === 'pending' || figurine.status === 'generating') && (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold mb-4">{figurine.name}</h1>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed">{figurine.description}</p>
            </div>

            {/* Style */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Style
              </h3>
              <span className="text-sm text-gold capitalize">{figurine.style}</span>
            </div>

            {/* Date */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Creee le
              </h3>
              <span className="text-sm text-gray-300">
                {figurine.createdAt.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Actions */}
            {figurine.status === 'ready' && (
              <div className="flex flex-col gap-4 mb-8">
                <button className="btn-primary w-full text-center">
                  Commander cette figurine (impression 3D)
                </button>
                {figurine.modelUrl && (
                  <a
                    href={figurine.modelUrl}
                    download={`${figurine.name}.glb`}
                    className="btn-outline w-full text-center"
                  >
                    Telecharger le fichier 3D (.glb)
                  </a>
                )}
              </div>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors mt-auto"
            >
              {deleting ? 'Suppression...' : 'Supprimer cette figurine'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
