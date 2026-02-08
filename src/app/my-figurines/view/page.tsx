'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useI18n } from '@/context/LanguageContext'
import { getFigurineById, updateFigurine, deleteFigurine, type CustomFigurine } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'
import ProductViewer3D from '@/components/ProductViewer3D'
import { COLORS } from '@/lib/constants'

// Prix fixe pour l'impression 3D d'une figurine personnalisee
const FIGURINE_PRINT_PRICE = 49.99

const COLOR_LABELS_EN: Record<string, string> = {
  rouge: 'Red',
  bleu: 'Blue',
  vert: 'Green',
  or: 'Gold',
  argent: 'Silver',
  noir: 'Black',
  blanc: 'White',
  violet: 'Purple',
  rose: 'Pink',
  orange: 'Orange',
  marron: 'Brown',
  turquoise: 'Turquoise',
}

const STYLE_LABELS_EN: Record<string, string> = {
  realistic: 'Realistic',
  cartoon: 'Cartoon',
  sculpture: 'Sculpture',
  'low-poly': 'Low Poly',
}

function FigurineDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const figurineId = searchParams.get('id')
  const { user, loading: authLoading } = useAuth()
  const { addItem } = useCart()
  const { t, locale, localeTag } = useI18n()

  const [figurine, setFigurine] = useState<CustomFigurine | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [pollingActive, setPollingActive] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const statusLabels: Record<CustomFigurine['status'], { label: string; color: string; bg: string }> = {
    pending: { label: t('En attente de generation', 'Waiting for generation'), color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    generating: { label: t('Generation en cours...', 'Generation in progress...'), color: 'text-blue-400', bg: 'bg-blue-400/10' },
    texturing: { label: t('Texturation en cours...', 'Texturing in progress...'), color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ready: { label: t('Figurine prete !', 'Figurine ready!'), color: 'text-green-400', bg: 'bg-green-400/10' },
    failed: { label: t('Generation echouee', 'Generation failed'), color: 'text-red-400', bg: 'bg-red-400/10' },
  }

  // Charger la figurine
  useEffect(() => {
    if (!figurineId) return
    getFigurineById(figurineId)
      .then((found) => {
        if (!found) {
          router.push('/my-figurines')
          return
        }
        setFigurine(found)
        // Si en cours de generation ou texturation, activer le polling
        if (found.status === 'pending' || found.status === 'generating' || found.status === 'texturing') {
          setPollingActive(true)
        }
      })
      .finally(() => setLoading(false))
  }, [figurineId, router])

  // Ref pour eviter double declenchement du refine
  const refineTriggeredRef = useRef(false)

  // Lancer le raffinement (texturation) apres le preview
  const triggerRefine = useCallback(async (
    fig: CustomFigurine,
    previewThumbnailUrl: string | null
  ) => {
    try {
      const texturePrompt = fig.texturePrompt || fig.description || ''

      const data = await apiFetch<{
        success: boolean
        refineTaskId: string
        figurineId: string
      }>('/meshy/refine', {
        method: 'POST',
        body: {
          previewTaskId: fig.meshyTaskId,
          texturePrompt,
          figurineId: fig.id,
        },
      })

      if (data.refineTaskId) {
        await updateFigurine(fig.id, {
          status: 'texturing',
          refineTaskId: data.refineTaskId,
          thumbnailUrl: previewThumbnailUrl || fig.thumbnailUrl,
        })
        setFigurine((prev) => prev ? {
          ...prev,
          status: 'texturing',
          refineTaskId: data.refineTaskId,
          thumbnailUrl: previewThumbnailUrl || prev.thumbnailUrl || '',
        } : null)
      }
    } catch (error) {
      console.error('Error triggering refine:', error)
      await updateFigurine(fig.id, { status: 'failed' })
      setFigurine((prev) => prev ? { ...prev, status: 'failed' } : null)
      setPollingActive(false)
    }
  }, [])

  // Polling du statut Meshy via l'API Express (2 phases: preview puis refine pour text, direct pour image)
  const checkMeshyStatus = useCallback(async () => {
    if (!figurine) return

    const isImageMode = figurine.generationMode === 'image'
    const isTexturing = figurine.status === 'texturing' && figurine.refineTaskId
    const taskIdToPoll = isTexturing ? figurine.refineTaskId : figurine.meshyTaskId

    if (!taskIdToPoll) return

    try {
      // Pour les figurines generees a partir d'images, utiliser le type 'image'
      const statusType = isImageMode && !isTexturing ? 'image' : 'text'
      const data = await apiFetch<{
        status: string
        progress: number
        modelUrl: string | null
        thumbnailUrl: string | null
      }>(`/meshy/status/${taskIdToPoll}?type=${statusType}`)

      if (data.status === 'SUCCEEDED') {
        if (isTexturing || isImageMode) {
          // Image mode: directement pret (pas d'etape refine)
          // Text mode refine: modele texture final pret
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
        } else {
          // Text mode preview termine -> lancer le refine automatiquement
          if (!refineTriggeredRef.current) {
            refineTriggeredRef.current = true
            await triggerRefine(figurine, data.thumbnailUrl)
          }
        }
      } else if (data.status === 'FAILED') {
        await updateFigurine(figurine.id, { status: 'failed' })
        setFigurine((prev) => prev ? { ...prev, status: 'failed' } : null)
        setPollingActive(false)
      } else if (data.status === 'IN_PROGRESS') {
        if (figurine.status === 'pending') {
          await updateFigurine(figurine.id, { status: 'generating' })
          setFigurine((prev) => prev ? { ...prev, status: 'generating' } : null)
        }
      }
    } catch (error) {
      console.error('Error checking Meshy status:', error)
    }
  }, [figurine, triggerRefine])

  // Polling interval
  useEffect(() => {
    if (!pollingActive) return

    const taskId = figurine?.status === 'texturing' ? figurine?.refineTaskId : figurine?.meshyTaskId
    if (!taskId) return

    const interval = setInterval(checkMeshyStatus, 10000) // Toutes les 10 secondes
    checkMeshyStatus() // Check immediat

    return () => clearInterval(interval)
  }, [pollingActive, figurine?.meshyTaskId, figurine?.refineTaskId, figurine?.status, checkMeshyStatus])

  // Verifier l'authentification
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Supprimer la figurine
  const handleDelete = async () => {
    if (!figurine || !confirm(t('Etes-vous sur de vouloir supprimer cette figurine ?', 'Are you sure you want to delete this figurine?'))) return
    setDeleting(true)
    try {
      await deleteFigurine(figurine.id)
      router.push('/my-figurines')
    } catch {
      alert(t('Erreur lors de la suppression', 'Error while deleting'))
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
  const styleLabel = locale === 'fr' ? figurine.style : STYLE_LABELS_EN[figurine.style] || figurine.style

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">{t('Accueil', 'Home')}</Link>
          <span className="mx-2">/</span>
          <Link href="/my-figurines" className="hover:text-gold transition-colors">{t('Mes figurines', 'My figurines')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{figurine.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: 3D Viewer */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square">
              {figurine.status === 'ready' && figurine.modelUrl ? (
                <ProductViewer3D modelUrl={figurine.modelUrl} className="h-full" />
              ) : figurine.status === 'generating' || figurine.status === 'pending' || figurine.status === 'texturing' ? (
                <div className="h-full bg-dark-tertiary rounded-2xl flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400">
                    {figurine.status === 'texturing'
                      ? t('Texturation en cours...', 'Texturing in progress...')
                      : t('Generation en cours...', 'Generation in progress...')}
                  </p>
                  <p className="text-xs text-gray-600">{t('Cela peut prendre plusieurs minutes', 'This can take several minutes')}</p>
                </div>
              ) : (
                <div className="h-full bg-dark-tertiary rounded-2xl flex flex-col items-center justify-center gap-4">
                  <svg className="w-16 h-16 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-400">{t('La generation a echoue', 'Generation failed')}</p>
                  <Link href="/create-figurine" className="text-sm text-gold hover:text-gold-light transition-colors">
                    {t('Reessayer avec une nouvelle figurine', 'Try again with a new figurine')}
                  </Link>
                </div>
              )}
            </div>

            {/* Controles 3D info */}
            {figurine.status === 'ready' && figurine.modelUrl && (
              <p className="text-xs text-gray-500 text-center mt-3">
                {t('Cliquez et faites glisser pour faire pivoter - Scrollez pour zoomer', 'Click and drag to rotate - Scroll to zoom')}
              </p>
            )}
          </motion.div>

          {/* Right: Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-4 ${status.bg}`}>
              {(figurine.status === 'pending' || figurine.status === 'generating' || figurine.status === 'texturing') && (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold mb-4">{figurine.name}</h1>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {t('Description', 'Description')}
              </h3>
              <p className="text-gray-300 leading-relaxed">{figurine.description}</p>
            </div>

            {/* Style */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {t('Style', 'Style')}
              </h3>
              <span className="text-sm text-gold capitalize">{styleLabel}</span>
            </div>

            {/* Image de reference (mode image) */}
            {figurine.generationMode === 'image' && figurine.referenceImageUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  {t('Image de reference', 'Reference image')}
                </h3>
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={figurine.referenceImageUrl}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Couleurs */}
            {figurine.colors && figurine.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  {t('Couleurs', 'Colors')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {figurine.colors.map((colorId) => {
                    const colorDef = COLORS.find((c) => c.id === colorId)
                    const label = locale === 'fr' ? colorDef?.label : COLOR_LABELS_EN[colorId] || colorDef?.label
                    return colorDef ? (
                      <span key={colorId} className="inline-flex items-center gap-1.5 text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorDef.hex }} />
                        {label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {t('Creee le', 'Created on')}
              </h3>
              <span className="text-sm text-gray-300">
                {figurine.createdAt.toLocaleString(localeTag, {
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
                {addedToCart ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-green-400 py-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">{t('Ajoute au panier !', 'Added to cart!')}</span>
                    </div>
                    <Link href="/cart" className="btn-primary w-full text-center">
                      {t('Voir le panier', 'View cart')}
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      addItem({
                        id: `figurine-${figurine.id}`,
                        name: figurine.name,
                        nameI18n: { fr: figurine.name, en: figurine.name },
                        price: FIGURINE_PRINT_PRICE,
                        image: figurine.thumbnailUrl,
                        figurineId: figurine.id,
                        modelUrl: figurine.modelUrl,
                      })
                      setAddedToCart(true)
                    }}
                    className="btn-primary w-full text-center"
                  >
                    {t(`Commander cette figurine - ${FIGURINE_PRINT_PRICE.toFixed(2)} EUR`, `Order this figurine - ${FIGURINE_PRINT_PRICE.toFixed(2)} EUR`)}
                  </button>
                )}
              </div>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors mt-auto"
            >
              {deleting ? t('Suppression...', 'Deleting...') : t('Supprimer cette figurine', 'Delete this figurine')}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function FigurineDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FigurineDetailContent />
    </Suspense>
  )
}
