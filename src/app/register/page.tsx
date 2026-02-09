'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { checkUsernameAvailability } from '@/lib/firestore'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError(t('Les mots de passe ne correspondent pas.', 'Passwords do not match.'))
      return
    }
    if (password.length < 6) {
      setError(t('Le mot de passe doit contenir au moins 6 caracteres.', 'Password must be at least 6 characters.'))
      return
    }

    const trimmedDisplayName = displayName.trim()
    if (trimmedDisplayName && trimmedDisplayName.length < 3) {
      setError(t('Le pseudo doit contenir au moins 3 caracteres.', 'Username must be at least 3 characters.'))
      return
    }
    if (trimmedDisplayName && trimmedDisplayName.length > 20) {
      setError(t('Le pseudo ne peut pas depasser 20 caracteres.', 'Username cannot exceed 20 characters.'))
      return
    }
    if (trimmedDisplayName && !/^[a-zA-Z0-9_]+$/.test(trimmedDisplayName)) {
      setError(t('Le pseudo ne peut contenir que des lettres, chiffres et underscores.', 'Username can only contain letters, numbers, and underscores.'))
      return
    }

    setLoading(true)
    try {
      // Check username uniqueness
      if (trimmedDisplayName) {
        const isAvailable = await checkUsernameAvailability(trimmedDisplayName)
        if (!isAvailable) {
          setError(t('Ce pseudo est deja pris.', 'This username is already taken.'))
          setLoading(false)
          return
        }
      }

      await register(email, password, trimmedDisplayName || undefined)
      router.push('/account')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("Erreur lors de l'inscription", 'Registration error')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2">{t('Creer un compte', 'Create an account')}</h1>
          <p className="text-sm text-gray-500 mb-8">
            {t('Rejoignez-nous pour une experience personnalisee.', 'Join us for a personalized experience.')}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder={t('vous@exemple.com', 'you@example.com')}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {t('Pseudo', 'Username')} <span className="text-xs text-gray-600">({t('optionnel', 'optional')})</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="username"
                className="input-field"
                placeholder={t('MonPseudo', 'MyUsername')}
                maxLength={20}
              />
              <p className="text-xs text-gray-600 mt-1">
                {t('3-20 caracteres, lettres, chiffres et _ uniquement', '3-20 characters, letters, numbers, and _ only')}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('Mot de passe', 'Password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="????????"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('Confirmer le mot de passe', 'Confirm password')}</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="input-field"
                placeholder="????????"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2 disabled:opacity-50"
            >
              {loading ? t('Inscription...', 'Signing up...') : t("S'inscrire", 'Sign up')}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            {t('Deja un compte ?', 'Already have an account?')}{' '}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
              {t('Se connecter', 'Log in')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
