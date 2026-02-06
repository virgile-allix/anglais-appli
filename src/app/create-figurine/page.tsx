'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { getFirebase } from '@/lib/firebase'
import { createCustomFigurine, updateFigurine } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'
import { COLORS, STYLES } from '@/lib/constants'

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

const STYLE_LABELS_EN: Record<string, { name: string; description: string }> = {
  realistic: { name: 'Realistic', description: 'Photorealistic render with fine details' },
  cartoon: { name: 'Cartoon', description: 'Colorful cartoon style' },
  sculpture: { name: 'Sculpture', description: 'Classic statue/sculpture style' },
  'low-poly': { name: 'Low Poly', description: 'Minimal geometric style' },
}

type GenerationMode = 'text' | 'image'

export default function CreateFigurinePage() {
  const { user, loading: authLoading } = useAuth()
  const { t, locale } = useI18n()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [generationMode, setGenerationMode] = useState<GenerationMode>('text')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('realistic')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColorText, setCustomColorText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : prev.length < 3 ? [...prev, colorId] : prev
    )
  }

  // Image handling functions
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('Veuillez selectionner une image valide', 'Please select a valid image'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('L\'image ne doit pas depasser 10 Mo', 'Image must not exceed 10 MB'))
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')
    const { storage } = getFirebase()
    const fileName = `figurines/${user.uid}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, fileName)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }

  const buildTexturePrompt = (): string => {
    const colorLabels = selectedColors.map(
      (id) => {
        const base = COLORS.find((c) => c.id === id)?.label
        if (locale === 'fr') return base
        return COLOR_LABELS_EN[id] || base
      }
    ).filter(Boolean)

    let prompt = ''
    if (colorLabels.length > 0) {
      prompt = `${t('Couleurs principales', 'Main colors')}: ${colorLabels.join(', ')}.`
    }
    if (customColorText.trim()) {
      prompt += ` ${customColorText.trim()}`
    }
    return prompt.trim()
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/create-figurine')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('Veuillez entrer un nom', 'Please enter a name'))
      return
    }

    // Validation selon le mode
    if (generationMode === 'text') {
      if (!description.trim()) {
        setError(t('Veuillez entrer une description', 'Please enter a description'))
        return
      }
      if (description.length < 20) {
        setError(t('La description doit faire au moins 20 caracteres', 'Description must be at least 20 characters'))
        return
      }
    } else {
      if (!imageFile) {
        setError(t('Veuillez selectionner une image', 'Please select an image'))
        return
      }
    }

    if (!user) return

    setLoading(true)

    try {
      let imageUrl: string | undefined

      // Upload image if in image mode
      if (generationMode === 'image' && imageFile) {
        setUploadingImage(true)
        imageUrl = await uploadImageToStorage(imageFile)
        setUploadingImage(false)
      }

      // Creer l'entree en base
      const figurineId = await createCustomFigurine({
        uid: user.uid,
        name: name.trim(),
        description: description.trim() || (generationMode === 'image' ? t('Genere a partir d\'une image', 'Generated from an image') : ''),
        style,
        status: 'pending',
        colors: selectedColors,
        customColorText: customColorText.trim(),
        texturePrompt: buildTexturePrompt(),
        ...(imageUrl && { referenceImageUrl: imageUrl }),
        generationMode,
      })

      // Lancer la generation Meshy via l'API Express
      const endpoint = generationMode === 'image' ? '/meshy/generate-from-image' : '/meshy/generate'
      const body = generationMode === 'image'
        ? { imageUrl, figurineId }
        : { prompt: description.trim(), style, figurineId }

      const data = await apiFetch<{ success: boolean; taskId: string; figurineId: string }>(endpoint, {
        method: 'POST',
        body,
      })

      // Mettre a jour la figurine avec le taskId Meshy
      if (data.taskId) {
        await updateFigurine(figurineId, { meshyTaskId: data.taskId, status: 'generating' })
      }

      // Rediriger vers la page de la figurine
      router.push(`/my-figurines/view?id=${figurineId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Une erreur est survenue', 'Something went wrong'))
      setLoading(false)
      setUploadingImage(false)
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
              {t('Creer ma', 'Create my')} <span className="text-gold">{t('Figurine', 'Figurine')}</span>
            </h1>
            <p className="text-gray-400">
              {t(
                'Decrivez votre figurine ideale et notre IA la generera en 3D pour vous.',
                'Describe your ideal figurine and our AI will generate it in 3D for you.'
              )}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl border border-white/10 p-1 bg-dark-secondary">
              <button
                type="button"
                onClick={() => setGenerationMode('text')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  generationMode === 'text'
                    ? 'bg-gold text-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('Texte', 'Text')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('image')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  generationMode === 'image'
                    ? 'bg-gold text-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('Image', 'Image')}
                </span>
              </button>
            </div>
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
                {t('Nom de la figurine', 'Figurine name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Ex: Dragon mystique, Guerrier medieval...', 'e.g. Mystic dragon, medieval warrior...')}
                className="input-field"
                maxLength={100}
              />
            </div>

            {/* Description (Text mode) */}
            {generationMode === 'text' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('Description detaillee', 'Detailed description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t(
                    `Decrivez votre figurine en detail : apparence, pose, couleurs, accessoires, style...\n\nEx: Un dragon majestueux aux ecailles bleu saphir, les ailes deployees, crachant des flammes orange. Il porte une couronne d'or et se tient sur un rocher.`,
                    `Describe your figurine in detail: appearance, pose, colors, accessories, style...\n\nExample: A majestic dragon with sapphire-blue scales, wings spread, breathing orange flames. It wears a golden crown and stands on a rock.`
                  )}
                  className="input-field min-h-[150px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {description.length}/500 {t('caracteres', 'characters')} - {t('Plus la description est detaillee, meilleur sera le resultat.', 'The more detailed the description, the better the result.')}
                </p>
              </div>
            )}

            {/* Image Upload (Image mode) */}
            {generationMode === 'image' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('Image de reference', 'Reference image')}
                </label>

                {!imagePreview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-gold bg-gold/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 mb-2">
                      {t('Glissez-deposez une image ou cliquez pour parcourir', 'Drag & drop an image or click to browse')}
                    </p>
                    <p className="text-xs text-gray-600">
                      PNG, JPG, WEBP - Max 10 Mo
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={600}
                      height={400}
                      className="w-full h-64 object-contain bg-dark-tertiary"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="p-3 bg-dark-secondary">
                      <p className="text-sm text-gray-400 truncate">{imageFile?.name}</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  {t(
                    'L\'IA analysera votre image pour creer une figurine 3D similaire. Pour de meilleurs resultats, utilisez une image claire avec un fond simple.',
                    'The AI will analyze your image to create a similar 3D figurine. For best results, use a clear image with a simple background.'
                  )}
                </p>

                {/* Optional description for image mode */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('Instructions supplementaires', 'Additional instructions')} <span className="text-gray-500">({t('optionnel', 'optional')})</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      'Ajoutez des details ou modifications souhaitees...',
                      'Add desired details or modifications...'
                    )}
                    className="input-field min-h-[80px] resize-none"
                    maxLength={300}
                  />
                </div>
              </div>
            )}

            {/* Style (Text mode only) */}
            {generationMode === 'text' && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('Style artistique', 'Art style')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STYLES.map((s) => {
                    const en = STYLE_LABELS_EN[s.id]
                    const nameLabel = locale === 'fr' ? s.name : en?.name || s.name
                    const descLabel = locale === 'fr' ? s.description : en?.description || s.description
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${style === s.id
                            ? 'border-gold bg-gold/10 text-white'
                            : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}
                      >
                        <p className="font-semibold text-sm">{nameLabel}</p>
                        <p className="text-xs mt-1 opacity-70">{descLabel}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Couleurs (Text mode only) */}
            {generationMode === 'text' && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('Couleurs souhaitees', 'Preferred colors')} <span className="text-gray-500">{t('(optionnel, max 3)', '(optional, max 3)')}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColor(c.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        selectedColors.includes(c.id)
                          ? 'border-gold bg-gold/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs text-gray-400">{locale === 'fr' ? c.label : COLOR_LABELS_EN[c.id] || c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Precision couleur personnalisee */}
                <div className="mt-4">
                  <input
                    type="text"
                    value={customColorText}
                    onChange={(e) => setCustomColorText(e.target.value)}
                    placeholder={t('Precision couleur personnalisee (ex: degrade bleu vers violet)...', 'Custom color details (e.g. blue to purple gradient)...')}
                    className="input-field text-sm"
                    maxLength={150}
                  />
                </div>
              </div>
            )}

            {/* Info prix */}
            <div className="mb-6 p-4 rounded-lg bg-gold/10 border border-gold/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gold font-medium">{t('Generation gratuite', 'Free generation')}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('La generation 3D est offerte. Vous pourrez ensuite commander votre figurine imprimee.', '3D generation is free. You can then order your printed figurine.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !name.trim() || (generationMode === 'text' ? !description.trim() : !imageFile)}
              className="btn-primary w-full text-center disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  {uploadingImage
                    ? t('Upload de l\'image...', 'Uploading image...')
                    : t('Generation en cours...', 'Generating...')
                  }
                </span>
              ) : (
                t('Generer ma figurine', 'Generate my figurine')
              )}
            </button>
          </form>

          {/* Lien mes figurines */}
          <div className="text-center mt-6">
            <Link
              href="/my-figurines"
              className="text-sm text-gray-500 hover:text-gold transition-colors"
            >
              {t('Voir mes figurines existantes', 'View my existing figurines')} &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
