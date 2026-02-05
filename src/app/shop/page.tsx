'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { getProducts, type Product } from '@/lib/firestore'
import ProductModal from '@/components/ProductModal'
import { useI18n } from '@/context/LanguageContext'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ShopPage() {
  const { addItem, items: cartItems } = useCart()
  const { t, pick } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

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
            {t('La', 'The')} <span className="text-gold">{t('Boutique', 'Shop')}</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            {t('Explorez notre selection de produits premium.', 'Explore our selection of premium products.')}
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Aucun produit */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-6 text-gray-700">&#9671;</p>
            <h2 className="text-xl font-semibold mb-3">{t('Aucun produit disponible', 'No products available')}</h2>
            <p className="text-gray-500">{t('Revenez bientot, notre catalogue sera mis a jour.', 'Come back soon, our catalog will be updated.')}</p>
          </motion.div>
        )}

        {/* Grille de produits */}
        {!loading && products.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product) => {
              const outOfStock = product.stock <= 0
              const inCart = cartItems.find((c) => c.id === product.id)?.quantity || 0
              const maxReached = inCart >= product.stock
              const productName = pick(product.nameI18n ?? product.name)
              const productDescription = pick(product.descriptionI18n ?? product.description)
              return (
                <motion.div key={product.id} variants={item} className="card group">
                  {/* Image - clickable to open modal */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="aspect-square bg-dark-tertiary flex items-center justify-center overflow-hidden relative cursor-pointer"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-6xl text-gray-700 group-hover:scale-110 transition-transform duration-500">
                        &#9670;
                      </span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-sm font-semibold text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                          {t('Rupture', 'Sold Out')}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-medium bg-dark/80 px-4 py-2 rounded-lg">
                        {t('Voir details', 'View details')}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-semibold text-lg mb-1 cursor-pointer hover:text-gold transition-colors"
                    >
                      {productName}
                    </h3>
                    {productDescription && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {productDescription}
                      </p>
                    )}
                    <p className="text-gold font-bold text-xl mb-4">
                      {product.price.toFixed(2)} &euro;
                    </p>
                    <button
                      disabled={outOfStock || maxReached}
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: productName,
                          nameI18n: product.nameI18n,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      className="btn-primary w-full text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {outOfStock
                        ? t('Rupture', 'Sold Out')
                        : maxReached
                          ? t(`Stock max (${product.stock})`, `Max stock (${product.stock})`)
                          : t('Ajouter au panier', 'Add to cart')}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
