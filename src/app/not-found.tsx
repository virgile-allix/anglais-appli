'use client'

import Link from 'next/link'
import { useI18n } from '@/context/LanguageContext'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-gold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          {t("Cette page n'existe pas.", 'This page does not exist.')}
        </p>
        <Link href="/" className="btn-primary">
          {t("Retour a l'accueil", 'Back to home')}
        </Link>
      </div>
    </div>
  )
}
