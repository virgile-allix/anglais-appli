'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/context/LanguageContext'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative z-50 border-t border-white/5 bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <Image
                src={`${basePath}/logo_sans_fond.png`}
                alt="Premium Store"
                width={120}
                height={35}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("Des produits d'exception, une experience unique.", 'Exceptional products, a unique experience.')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              {t('Navigation', 'Navigation')}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Accueil', 'Home')}</Link>
              <Link href="/shop" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Boutique', 'Shop')}</Link>
              <Link href="/cart" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Panier', 'Cart')}</Link>
              <Link href="/orders" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Mes commandes', 'My orders')}</Link>
            </div>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              {t('Mon compte', 'My account')}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/account" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Mon profil', 'My profile')}</Link>
              <Link href="/support" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Support', 'Support')}</Link>
              <Link href="/login" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Connexion', 'Log in')}</Link>
              <Link href="/register" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Inscription', 'Sign up')}</Link>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              {t('Informations', 'Information')}
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/cgv" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('CGV', 'Terms')}</Link>
              <Link href="/mentions-legales" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Mentions legales', 'Legal notice')}</Link>
              <Link href="/confidentialite" className="text-sm text-gray-500 hover:text-gold transition-colors">{t('Confidentialite', 'Privacy')}</Link>
              <span className="text-sm text-gray-500">support@premiumstore.fr</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Premium Store. {t('Tous droits reserves.', 'All rights reserved.')}
          </p>
          <div className="flex gap-4">
            <Link href="/cgv" className="text-xs text-gray-600 hover:text-gold transition-colors">{t('CGV', 'Terms')}</Link>
            <Link href="/mentions-legales" className="text-xs text-gray-600 hover:text-gold transition-colors">{t('Mentions legales', 'Legal notice')}</Link>
            <Link href="/confidentialite" className="text-xs text-gray-600 hover:text-gold transition-colors">{t('Confidentialite', 'Privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
