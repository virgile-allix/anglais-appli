'use client'

import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'

// ── Produits placeholder (à remplacer par Firestore plus tard) ──
const PRODUCTS = [
  { id: '1', name: 'Produit Alpha', price: 49.99, image: '' },
  { id: '2', name: 'Produit Beta', price: 79.99, image: '' },
  { id: '3', name: 'Produit Gamma', price: 129.99, image: '' },
  { id: '4', name: 'Produit Delta', price: 199.99, image: '' },
  { id: '5', name: 'Produit Epsilon', price: 59.99, image: '' },
  { id: '6', name: 'Produit Zeta', price: 89.99, image: '' },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ShopPage() {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            La <span className="text-gold">Boutique</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Explorez notre sélection de produits premium.
          </p>
        </motion.div>

        {/* Grille de produits */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {PRODUCTS.map((product) => (
            <motion.div key={product.id} variants={item} className="card group">
              {/* Image placeholder */}
              <div className="aspect-square bg-dark-tertiary flex items-center justify-center overflow-hidden">
                <span className="text-6xl text-gray-700 group-hover:scale-110 transition-transform duration-500">
                  ◆
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-gold font-bold text-xl mb-4">
                  {product.price.toFixed(2)} &euro;
                </p>
                <button
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                    })
                  }
                  className="btn-primary w-full text-center text-sm"
                >
                  Ajouter au panier
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
