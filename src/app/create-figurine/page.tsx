'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { createCustomFigurine, updateFigurine } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'

const STYLES = [
  { id: 'realistic', name: 'Realiste', description: 'Rendu photoréaliste avec details fins' },
  { id: 'cartoon', name: 'Cartoon', description: 'Style dessin anime colore' },
  { id: 'sculpture', name: 'Sculpture', description: 'Style statue/sculpture classique' },
  { id: 'low-poly', name: 'Low Poly', description: 'Style geometrique minimaliste' },
]

export default function CreateFigurinePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('realistic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/create-figurine')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !description.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (description.length < 20) {
      setError('La description doit faire au moins 20 caracteres')
      return
    }

    if (!user) return

    setLoading(true)

    try {
      // Creer l'entree en base
      const figurineId = await createCustomFigurine({
        uid: user.uid,
        name: name.trim(),
        description: description.trim(),
        style,
        status: 'pending',
      })

      // Lancer la generation Meshy via l'API Express
      const data = await apiFetch<{ success: boolean; taskId: string; figurineId: string }>('/meshy/generate', {
        method: 'POST',
        body: {
          prompt: description.trim(),
          style,
          figurineId,
        },
      })

      // Mettre a jour la figurine avec le taskId Meshy
      if (data.taskId) {
        await updateFigurine(figurineId, { meshyTaskId: data.taskId, status: 'generating' })
      }

      // Rediriger vers la page de la figurine
      router.push(`/my-figurines/${figurineId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Creer ma <span className="text-gold">Figurine</span>
            </h1>
            <p className="text-gray-400">
              Decrivez votre figurine ideale et notre IA la generera en 3D pour vous.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="card p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nom */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la figurine
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dragon mystique, Guerrier medieval..."
                className="input-field"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description detaillee
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez votre figurine en detail : apparence, pose, couleurs, accessoires, style...&#10;&#10;Ex: Un dragon majestueux aux ecailles bleu saphir, les ailes deployees, crachant des flammes orange. Il porte une couronne d'or et se tient sur un rocher."
                className="input-field min-h-[150px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">
                {description.length}/500 caracteres - Plus la description est detaillee, meilleur sera le resultat.
              </p>
            </div>

            {/* Style */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Style artistique
              </label>
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      style === s.id
                        ? 'border-gold bg-gold/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs mt-1 opacity-70">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info prix */}
            <div className="mb-6 p-4 rounded-lg bg-gold/10 border border-gold/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gold font-medium">Generation gratuite</p>
                  <p className="text-xs text-gray-400 mt-1">
                    La generation 3D est offerte. Vous pourrez ensuite commander votre figurine imprimee.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="btn-primary w-full text-center disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  Generation en cours...
                </span>
              ) : (
                'Generer ma figurine'
              )}
            </button>
          </form>

          {/* Lien mes figurines */}
          <div className="text-center mt-6">
            <Link
              href="/my-figurines"
              className="text-sm text-gray-500 hover:text-gold transition-colors"
            >
              Voir mes figurines existantes &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
