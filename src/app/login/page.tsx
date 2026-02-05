'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/account')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('Erreur de connexion', 'Login error')
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
          <h1 className="text-2xl font-bold mb-2">{t('Connexion', 'Log in')}</h1>
          <p className="text-sm text-gray-500 mb-8">
            {t('Accedez a votre espace personnel.', 'Access your personal space.')}
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
              <label className="block text-sm text-gray-400 mb-1">{t('Mot de passe', 'Password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field"
                placeholder="????????"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2 disabled:opacity-50"
            >
              {loading ? t('Connexion...', 'Logging in...') : t('Se connecter', 'Log in')}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            {t('Pas encore de compte ?', "Don't have an account?")}{' '}
            <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
              {t('Creer un compte', 'Create an account')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
