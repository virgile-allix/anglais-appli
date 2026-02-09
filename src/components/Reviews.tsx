'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { getProductReviews, createReview, getUserReviewForProduct, deleteReview, type Review } from '@/lib/firestore'

type ReviewsProps = {
  productId: string
}

export default function Reviews({ productId }: ReviewsProps) {
  const { user } = useAuth()
  const { t, localeTag } = useI18n()

  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReviews()
  }, [productId, user])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const allReviews = await getProductReviews(productId)
      setReviews(allReviews)
      if (user) {
        const existing = await getUserReviewForProduct(user.uid, productId)
        setUserReview(existing)
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError(t('Vous devez etre connecte pour laisser un avis', 'You must be logged in to leave a review'))
      return
    }
    if (!comment.trim()) {
      setError(t('Veuillez entrer un commentaire', 'Please enter a comment'))
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await createReview({
        productId,
        uid: user.uid,
        userEmail: user.email || 'Anonymous',
        rating,
        comment: comment.trim(),
      })
      setComment('')
      setRating(5)
      setShowForm(false)
      await loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Erreur lors de la soumission', 'Error submitting review'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!userReview || !confirm(t('Supprimer votre avis ?', 'Delete your review?'))) return
    try {
      await deleteReview(userReview.id)
      setUserReview(null)
      await loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Erreur lors de la suppression', 'Error deleting review'))
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`w-5 h-5 ${filled ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/3" />
          <div className="h-20 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Header avec moyenne */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {t('Avis clients', 'Customer Reviews')} ({reviews.length})
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= Math.round(averageRating)} />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {averageRating.toFixed(1)} / 5
              </span>
            </div>
          )}
        </div>
        {user && !userReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {t('Laisser un avis', 'Leave a review')}
          </button>
        )}
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 border border-white/10 rounded-lg p-4"
          >
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('Votre note', 'Your rating')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon filled={star <= rating} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                {t('Votre commentaire', 'Your comment')}
              </label>
              <textarea
                className="input-field w-full"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('Partagez votre experience...', 'Share your experience...')}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? t('Envoi...', 'Submitting...') : t('Publier', 'Publish')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-outline"
              >
                {t('Annuler', 'Cancel')}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Avis de l'utilisateur */}
      {userReview && (
        <div className="border border-gold/30 rounded-lg p-4 bg-gold/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('Votre avis', 'Your review')}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= userReview.rating} />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {userReview.createdAt.toLocaleDateString(localeTag)}
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              {t('Supprimer', 'Delete')}
            </button>
          </div>
          <p className="text-gray-300">{userReview.comment}</p>
        </div>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{t('Aucun avis pour le moment', 'No reviews yet')}</p>
          <p className="text-sm mt-1">
            {t('Soyez le premier a laisser un avis !', 'Be the first to leave a review!')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-white/10 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{review.userEmail}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= review.rating} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {review.createdAt.toLocaleDateString(localeTag)}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
