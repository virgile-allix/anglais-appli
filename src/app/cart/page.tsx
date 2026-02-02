'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()

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
          <p className="text-gray-500 mb-8">
            Parcourez notre boutique pour trouver votre bonheur.
          </p>
          <Link href="/shop" className="btn-primary">
            Voir la boutique
          </Link>
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
              exit={{ opacity: 0, x: 20 }}
              className="card p-5 flex items-center gap-5"
            >
              {/* Thumbnail placeholder */}
              <div className="w-16 h-16 bg-dark-tertiary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl text-gray-700">◆</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-gold text-sm">{item.price.toFixed(2)} &euro;</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <p className="font-bold text-sm w-20 text-right">
                {(item.price * item.quantity).toFixed(2)} &euro;
              </p>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gold">
              {totalPrice.toFixed(2)} &euro;
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={clearCart} className="btn-outline flex-1 text-center text-sm">
              Vider le panier
            </button>
            <button className="btn-primary flex-1 text-center text-sm">
              Passer commande
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
