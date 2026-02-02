'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/firestore'
import { apiFetch } from '@/lib/api'

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId || !user) return

    const verify = async () => {
      try {
        const token = await user.getIdToken()

        // Verify Stripe session via API
        await apiFetch('/stripe/verify-session', {
          method: 'POST',
          body: { sessionId },
          token,
        })

        // Save order in Firestore
        if (items.length > 0) {
          await createOrder({
            uid: user.uid,
            items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
            total: totalPrice,
            status: 'paid',
            paymentId: sessionId,
            paymentMethod: 'stripe',
          })
          clearCart()
        }

        setStatus('success')
      } catch {
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
            <p className="text-gray-400">Vérification du paiement...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3">Paiement confirmé</h1>
            <p className="text-gray-400 mb-8">Merci pour votre commande. Vous pouvez suivre son avancement depuis votre espace.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/orders" className="btn-primary">Mes commandes</Link>
              <Link href="/shop" className="btn-outline">Continuer mes achats</Link>
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
            <h1 className="text-2xl font-bold mb-3">Erreur de vérification</h1>
            <p className="text-gray-400 mb-8">Nous n&apos;avons pas pu confirmer votre paiement. Contactez le support si le montant a été débité.</p>
            <Link href="/cart" className="btn-outline">Retour au panier</Link>
          </>
        )}
      </motion.div>
    </div>
  )
}
