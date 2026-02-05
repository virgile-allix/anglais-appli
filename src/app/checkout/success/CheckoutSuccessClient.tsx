'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart, type CartItem } from '@/context/CartContext'
import { useI18n } from '@/context/LanguageContext'
import { createOrder, incrementPromoUsage, decrementStock, type Address } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { user } = useAuth()
  const { clearCart } = useCart()
  const { t } = useI18n()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const processedRef = useRef(false)

  useEffect(() => {
    if (!sessionId || !user) return
    if (processedRef.current) return // Eviter double execution
    processedRef.current = true

    const verify = async () => {
      try {
        const token = await user.getIdToken()

        // Verify Stripe session via API
        const result = await apiFetch<{
          verified: boolean
          sessionId: string
          amountTotal: number
          promoId: string
          discountPercent: number
        }>('/stripe/verify-session', {
          method: 'POST',
          body: { sessionId },
          token,
        })

        // Recuperer les items et l'adresse stockes avant le redirect
        let checkoutItems: CartItem[] = []
        let shippingAddress: Address | undefined
        try {
          const stored = localStorage.getItem('ps-checkout-items')
          if (stored) {
            checkoutItems = JSON.parse(stored)
            localStorage.removeItem('ps-checkout-items')
          }
          const storedAddress = localStorage.getItem('ps-shipping-address')
          if (storedAddress) {
            shippingAddress = JSON.parse(storedAddress)
            localStorage.removeItem('ps-shipping-address')
          }
        } catch {}

        if (checkoutItems.length === 0) {
          console.error('No checkout items found')
          setStatus('error')
          return
        }

        // Incrementer l'usage du code promo si utilise
        const promoId = result.promoId || ''
        if (promoId) {
          try {
            await incrementPromoUsage(promoId)
          } catch {
            // Non bloquant
          }
          localStorage.removeItem('ps-promo')
        }

        // Calculer le total final (montant Stripe en centimes -> euros)
        const paidTotal = result.amountTotal ? result.amountTotal / 100 : checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

        // Save order in Firestore avec adresse de livraison
        await createOrder({
          uid: user.uid,
          items: checkoutItems.map((i) => ({
            id: i.id,
            name: i.name,
            nameI18n: i.nameI18n,
            price: i.price,
            quantity: i.quantity,
          })),
          total: paidTotal,
          status: 'paid',
          paymentId: sessionId,
          paymentMethod: 'stripe',
          shippingAddress,
        })

        // Decrementer le stock de chaque produit
        for (const item of checkoutItems) {
          try {
            await decrementStock(item.id, item.quantity)
          } catch {
            // Non bloquant
          }
        }

        // Vider le panier
        clearCart()

        setStatus('success')
      } catch (err) {
        console.error('Checkout verification error:', err)
        setStatus('error')
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user])

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-400">{t('Verification du paiement...', 'Verifying payment...')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">{t('Paiement confirme', 'Payment confirmed')}</h1>
            <p className="text-gray-400 mb-8">{t('Merci pour votre commande. Vous pouvez suivre son avancement depuis votre espace.', 'Thanks for your order. You can track progress from your account.')}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/orders" className="btn-primary">{t('Mes commandes', 'My orders')}</Link>
              <Link href="/shop" className="btn-outline">{t('Continuer mes achats', 'Continue shopping')}</Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">{t('Erreur de verification', 'Verification error')}</h1>
            <p className="text-gray-400 mb-8">{t("Nous n'avons pas pu confirmer votre paiement. Contactez le support si le montant a ete debite.", 'We could not confirm your payment. Contact support if you were charged.')}</p>
            <Link href="/cart" className="btn-outline">{t('Retour au panier', 'Back to cart')}</Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
