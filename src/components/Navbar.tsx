'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useI18n } from '@/context/LanguageContext'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function Navbar() {
  const { user, logout, profile } = useAuth()
  const { totalItems } = useCart()
  const { t, locale, setLocale, toggleLocale } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const links = [
    { href: '/', label: t('Accueil', 'Home') },
    { href: '/shop', label: t('Boutique', 'Shop') },
    { href: '/create-figurine', label: t('Creer ma figurine', 'Create my figurine'), highlight: true },
    ...(user ? [{ href: '/orders', label: t('Mes commandes', 'My orders') }, { href: '/support', label: t('Support', 'Support') }] : []),
    ...(profile?.isAdmin ? [{ href: '/admin', label: t('Administration', 'Admin') }] : []),
  ]

  const FlagGB = () => (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 60 40">
      <rect fill="#012169" width="60" height="40"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )

  const FlagFR = () => (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 60 40">
      <rect fill="#002395" width="20" height="40"/>
      <rect fill="#fff" x="20" width="20" height="40"/>
      <rect fill="#ED2939" x="40" width="20" height="40"/>
    </svg>
  )

  const languages = [
    { code: 'en' as const, flag: <FlagGB />, label: 'EN' },
    { code: 'fr' as const, flag: <FlagFR />, label: 'FR' },
  ]
  const currentLang = languages.find((l) => l.code === locale) || languages[0]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={`${basePath}/logo_sans_fond.png`}
            alt="Premium Store"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-200 ${
                'highlight' in link && link.highlight
                  ? 'text-gold font-medium hover:text-gold-light'
                  : 'text-gray-300 hover:text-gold'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language selector */}
          <div ref={langRef} className="hidden md:block relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-colors"
            >
              {currentLang.flag}
              <span>{currentLang.label}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-32 rounded-xl border border-white/10 bg-dark/95 backdrop-blur-md shadow-lg overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setLangOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        locale === lang.code
                          ? 'text-gold bg-gold/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {lang.flag}
                      <span>{lang.label === 'EN' ? 'English' : 'Francais'}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panier */}
          <Link href="/cart" className="relative text-gray-300 hover:text-gold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/account"
                className="text-sm text-gray-300 hover:text-gold transition-colors"
              >
                {t('Mon compte', 'My account')}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {t('Deconnexion', 'Log out')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:block text-sm text-gray-300 hover:text-gold transition-colors"
            >
              {t('Connexion', 'Log in')}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-300 hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code); setMobileOpen(false) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      locale === lang.code
                        ? 'bg-gold/10 text-gold border border-gold/30'
                        : 'text-gray-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {lang.flag}
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
              {user ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-gold transition-colors">
                    {t('Mon compte', 'My account')}
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="text-left text-gray-500 hover:text-white transition-colors">
                    {t('Deconnexion', 'Log out')}
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-gold transition-colors">
                  {t('Connexion', 'Log in')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
