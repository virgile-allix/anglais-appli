'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import { createOrder } from '@/lib/firestore'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [stripeLoading, setStripeLoading] = useState(false)
  const [error, setError] = useState('')

  /* ── Stripe Checkout ── */
  const handleStripe = async () => {
    setError('')
    if (!user) { router.push('/login'); return }

    setStripeLoading(true)
    try {
      const token = await user.getIdToken()
      const { url } = await apiFetch<{ url: string }>('/stripe/create-checkout', {
        method: 'POST',
        body: { items },
        token,
      })
      window.location.href = url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur Stripe')
    } finally {
      setStripeLoading(false)
    }
  }

  /* ── PayPal : créer la commande côté API ── */
  const handlePayPalCreate = async (): Promise<string> => {
    if (!user) { router.push('/login'); return '' }
    const token = await user.getIdToken()
    const { orderId } = await apiFetch<{ orderId: string }>('/paypal/create-order', {
      method: 'POST',
      body: { items },
      token,
    })
    return orderId
  }

  /* ── PayPal : capturer après approbation ── */
  const handlePayPalApprove = async (data: { orderID: string }) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      await apiFetch('/paypal/capture-order', {
        method: 'POST',
        body: { orderId: data.orderID },
        token,
      })
      // Sauvegarder la commande en Firestore
      await createOrder({
        uid: user.uid,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total: totalPrice,
        status: 'paid',
        stripeSessionId: `paypal_${data.orderID}`,
      })
      clearCart()
      router.push('/orders')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur PayPal')
    }
  }

  /* ── Panier vide ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-6xl mb-6 text-gray-700">◇</p>
          <h1 className="text-2xl font-bold mb-3">Votre panier est vide</h1>
          <p className="text-gray-500 mb-8">Parcourez notre boutique pour trouver votre bonheur.</p>
          <Link href="/shop" className="btn-primary">Voir la boutique</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-10"
        >
          Votre <span className="text-gold">Panier</span>
        </motion.h1>

        {/* Items */}
        <div className="flex flex-col gap-4 mb-10">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-5 flex items-center gap-5"
            >
              <div className="w-16 h-16 bg-dark-tertiary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-700">◆</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-gold text-sm">{item.price.toFixed(2)} &euro;</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center">-</button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center">+</button>
              </div>
              <p className="font-bold text-sm w-20 text-right">{(item.price * item.quantity).toFixed(2)} &euro;</p>
              <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Récapitulatif + Paiement */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gold">{totalPrice.toFixed(2)} &euro;</span>
          </div>

          {!user && (
            <p className="text-sm text-gray-500 mb-4 text-center">
              <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Connectez-vous</Link>{' '}
              pour passer commande.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {/* Stripe */}
            <button
              onClick={handleStripe}
              disabled={stripeLoading}
              className="btn-primary w-full text-center text-sm disabled:opacity-50"
            >
              {stripeLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  Redirection Stripe...
                </span>
              ) : (
                'Payer par carte (Stripe)'
              )}
            </button>

            {/* PayPal */}
            {PAYPAL_CLIENT_ID ? (
              <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                <PayPalButtons
                  style={{ layout: 'horizontal', color: 'gold', shape: 'pill', label: 'pay' }}
                  createOrder={handlePayPalCreate}
                  onApprove={handlePayPalApprove}
                  onError={() => setError('Erreur PayPal. Réessayez.')}
                />
              </PayPalScriptProvider>
            ) : (
              <p className="text-xs text-gray-600 text-center">
                PayPal sera disponible prochainement.
              </p>
            )}

            {/* Vider */}
            <button onClick={clearCart} className="btn-outline w-full text-center text-sm">
              Vider le panier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
