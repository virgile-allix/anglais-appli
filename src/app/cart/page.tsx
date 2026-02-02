'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import { createOrder, getProducts, validatePromoCode, incrementPromoUsage, type PromoCode } from '@/lib/firestore'

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  'AUK8O1juYSUliqvNFTKd4tLxQ6eFnb0tXaF1raWoMbwv7ZPWq4dK59vnlUmprrbzV86yF9VzqiF4CPse'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [stripeLoading, setStripeLoading] = useState(false)
  const [error, setError] = useState('')
  const [stockWarning, setStockWarning] = useState('')

  // Promo code
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState('')

  const discount = appliedPromo ? totalPrice * (appliedPromo.discount / 100) : 0
  const finalPrice = totalPrice - discount

  // Verifier le stock des articles du panier
  useEffect(() => {
    if (items.length === 0) return
    getProducts().then((products) => {
      const removed: string[] = []
      for (const item of items) {
        const product = products.find((p) => p.id === item.id)
        if (!product || product.stock <= 0) {
          removeItem(item.id)
          removed.push(item.name)
        }
      }
      if (removed.length > 0) {
        setStockWarning(`Article(s) supprime(s) du panier (plus en stock) : ${removed.join(', ')}`)
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const promo = await validatePromoCode(code)
      if (!promo) {
        setPromoError('Code promo invalide ou expire.')
        setAppliedPromo(null)
      } else {
        setAppliedPromo(promo)
        setPromoError('')
      }
    } catch {
      setPromoError('Erreur lors de la verification.')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoInput('')
    setPromoError('')
  }

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
      // Incrementer l'usage du code promo
      if (appliedPromo) {
        await incrementPromoUsage(appliedPromo.id)
      }
      // Sauvegarder la commande en Firestore
      await createOrder({
        uid: user.uid,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total: finalPrice,
        status: 'paid',
        paymentId: data.orderID,
        paymentMethod: 'paypal',
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

        {/* Avertissement stock */}
        <AnimatePresence>
          {stockWarning && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              {stockWarning}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Récapitulatif + Paiement */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Sous-total</span>
            <span className="text-lg font-semibold">{totalPrice.toFixed(2)} &euro;</span>
          </div>

          {/* Code promo */}
          <div className="mb-4 pt-3 border-t border-white/5">
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Code promo</label>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <div>
                  <span className="text-green-400 font-semibold text-sm">{appliedPromo.code}</span>
                  <span className="text-green-400/70 text-sm ml-2">-{appliedPromo.discount}%</span>
                </div>
                <button onClick={handleRemovePromo} className="text-gray-500 hover:text-red-400 transition-colors text-sm">
                  Retirer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold/50 transition-colors uppercase"
                  placeholder="Entrez votre code..."
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo() } }}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoInput.trim()}
                  className="btn-primary px-5 text-sm disabled:opacity-50"
                >
                  {promoLoading ? '...' : 'Appliquer'}
                </button>
              </div>
            )}
            {promoError && (
              <p className="text-red-400 text-xs mt-2">{promoError}</p>
            )}
          </div>

          {/* Reduction */}
          {appliedPromo && (
            <div className="flex items-center justify-between mb-2 text-green-400">
              <span className="text-sm">Reduction (-{appliedPromo.discount}%)</span>
              <span className="text-sm font-semibold">-{discount.toFixed(2)} &euro;</span>
            </div>
          )}

          {/* Total final */}
          <div className="flex items-center justify-between mb-6 pt-3 border-t border-white/5">
            <span className="text-gray-400 font-semibold">Total</span>
            <span className="text-2xl font-bold text-gold">{finalPrice.toFixed(2)} &euro;</span>
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
