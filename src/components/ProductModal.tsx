'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { type Product } from '@/lib/firestore'
import ProductViewer3D from './ProductViewer3D'

type Props = {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
  const { addItem, items: cartItems } = useCart()
  const [activeTab, setActiveTab] = useState<'image' | '3d'>('image')
  const [quantity, setQuantity] = useState(1)

  // Reset quand le produit change
  useEffect(() => {
    setQuantity(1)
    setActiveTab('image')
  }, [product?.id])

  // Fermer avec Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!product) return null

  const inCart = cartItems.find((c) => c.id === product.id)?.quantity || 0
  const maxReached = inCart + quantity > product.stock
  const outOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (outOfStock || maxReached) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setQuantity(1)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-[71] bg-dark-secondary border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left: Image / 3D Viewer */}
            <div className="w-full md:w-1/2 bg-dark-tertiary p-4 md:p-6 flex flex-col">
              {/* Tabs si modele 3D disponible */}
              {product.model3d && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'image'
                        ? 'bg-gold text-dark font-semibold'
                        : 'bg-dark text-gray-400 hover:text-white'
                    }`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                      activeTab === '3d'
                        ? 'bg-gold text-dark font-semibold'
                        : 'bg-dark text-gray-400 hover:text-white'
                    }`}
                  >
                    Vue 3D
                  </button>
                </div>
              )}

              {/* Contenu */}
              <div className="flex-1 flex items-center justify-center">
                {activeTab === '3d' && product.model3d ? (
                  <ProductViewer3D modelUrl={product.model3d} className="w-full h-full min-h-[300px]" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center rounded-xl overflow-hidden relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-8xl text-gray-700">&#9670;</span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-lg font-semibold text-red-400 bg-red-400/10 px-4 py-2 rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
              {/* Category badge */}
              <span className="text-xs text-gold uppercase tracking-wider mb-2">{product.category}</span>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h2>

              {/* Price */}
              <p className="text-2xl font-bold text-gold mb-4">{product.price.toFixed(2)} &euro;</p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                {outOfStock ? (
                  <span className="text-sm text-red-400">Rupture de stock</span>
                ) : product.stock <= 5 ? (
                  <span className="text-sm text-yellow-400">Plus que {product.stock} en stock</span>
                ) : (
                  <span className="text-sm text-green-400">En stock ({product.stock})</span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </p>
              </div>

              {/* Quantity + Add to cart */}
              {!outOfStock && (
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Quantite</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock - inCart, quantity + 1))}
                        disabled={quantity >= product.stock - inCart}
                        className="w-9 h-9 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    {inCart > 0 && (
                      <span className="text-xs text-gray-500">({inCart} dans panier)</span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={maxReached}
                    className="btn-primary w-full text-center disabled:opacity-50"
                  >
                    {maxReached ? 'Stock maximum atteint' : 'Ajouter au panier'}
                  </button>
                </div>
              )}

              {/* Link to full page */}
              <Link
                href={`/product/${product.id}`}
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gold transition-colors mt-4 text-center"
              >
                Voir la page complete &rarr;
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
