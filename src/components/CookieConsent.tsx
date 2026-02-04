'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_KEY = 'ps-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_KEY)
      if (!consent) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try { localStorage.setItem(COOKIE_KEY, 'accepted') } catch {}
    setVisible(false)
  }

  const handleRefuse = () => {
    try { localStorage.setItem(COOKIE_KEY, 'refused') } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-dark-secondary border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">Cookies & Vie privee</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ce site utilise des cookies essentiels au fonctionnement du service (authentification, panier, preferences).
                  Conformement au RGPD et a la loi Informatique et Libertes, nous respectons votre vie privee.
                  Aucun cookie publicitaire ou de tracking tiers n&apos;est utilise.
                  En continuant votre navigation, vous acceptez l&apos;utilisation de ces cookies fonctionnels.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Pour en savoir plus, consultez notre{' '}
                  <Link
                    href="/confidentialite"
                    className="text-gold hover:text-gold-light transition-colors underline"
                  >
                    politique de confidentialite
                  </Link>.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleRefuse}
                  className="px-5 py-2.5 text-sm rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2.5 text-sm rounded-xl bg-gold text-dark font-semibold hover:bg-gold-light transition-colors"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
