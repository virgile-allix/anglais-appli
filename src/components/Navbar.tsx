'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const { user, logout, profile } = useAuth()
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/shop', label: 'Boutique' },
    { href: '/create-figurine', label: 'Creer ma figurine', highlight: true },
    ...(user ? [{ href: '/orders', label: 'Mes commandes' }, { href: '/support', label: 'Support' }] : []),
    ...(profile?.isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-gold">PREMIUM</span>
          <span className="text-white ml-1">STORE</span>
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
                Mon compte
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:block text-sm text-gray-300 hover:text-gold transition-colors"
            >
              Connexion
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
              {user ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-gold transition-colors">
                    Mon compte
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="text-left text-gray-500 hover:text-white transition-colors">
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-gold transition-colors">
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
