'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/context/LanguageContext'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-[10rem] md:text-[14rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold to-gold/20 select-none">
            404
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-400 mb-3 -mt-4"
        >
          {t('Page introuvable', 'Page not found')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-sm text-gray-600 mb-10 max-w-md mx-auto"
        >
          {t(
            "La page que vous recherchez n'existe pas ou a ete deplacee.",
            'The page you are looking for does not exist or has been moved.'
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/" className="btn-primary">
            {t("Retour a l'accueil", 'Back to home')}
          </Link>
          <Link
            href="/shop"
            className="text-sm text-gray-400 hover:text-gold transition-colors"
          >
            {t('Voir la boutique', 'Browse the shop')} &rarr;
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
