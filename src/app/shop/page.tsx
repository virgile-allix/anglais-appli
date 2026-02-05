'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Video reveal: circle clip-path expanding from center
      gsap.fromTo(
        '.shop-video-reveal',
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(100% at 50% 50%)',
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '75% top',
            scrub: 0.6,
          },
        }
      )

      // Golden ring expanding and fading
      gsap.fromTo(
        '.shop-golden-ring',
        { scale: 0.08, opacity: 1 },
        {
          scale: 3.5,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '55% top',
            scrub: 0.6,
          },
        }
      )

      // Hero text fading out and moving up
      gsap.to('.shop-hero-text', {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '25% top',
          scrub: true,
        },
      })

      // Decorative corners fade out
      gsap.to('.shop-corner', {
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: '20% top',
          end: '40% top',
          scrub: true,
        },
      })

      // Scroll indicator fade
      gsap.to('.shop-scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: '3% top',
          end: '10% top',
          scrub: true,
        },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div>
      {/* ===== VIDEO HERO WITH CIRCULAR REVEAL ===== */}
      <section ref={heroRef} className="relative" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Dark base */}
          <div className="absolute inset-0 bg-dark" />

          {/* Subtle center glow before reveal */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,168,83,0.06)_0%,transparent_50%)]" />

          {/* Golden ring glow */}
          <div
            className="shop-golden-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vmin] h-[40vmin] rounded-full border-[1.5px] border-gold/50 pointer-events-none z-[2]"
            style={{
              boxShadow:
                '0 0 80px rgba(212,168,83,0.25), 0 0 30px rgba(212,168,83,0.15), inset 0 0 80px rgba(212,168,83,0.1)',
            }}
          />

          {/* Video reveal layer */}
          <div
            className="shop-video-reveal absolute inset-0 z-[1]"
            style={{ clipPath: 'circle(0% at 50% 50%)' }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover scale-105"
            >
              <source src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/shop-hero.mp4`} type="video/mp4" />
            </video>
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-transparent to-dark" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(10,10,10,0.7))]" />
          </div>

          {/* Hero text */}
          <div className="shop-hero-text absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gold mb-4"
              >
                {t('Collection exclusive', 'Exclusive collection')}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
              >
                {t('La', 'The')}{' '}
                <span className="gradient-text">{t('Boutique', 'Shop')}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-lg text-gray-400 max-w-md mx-auto"
              >
                {t(
                  'Explorez notre selection de produits premium.',
                  'Explore our selection of premium products.'
                )}
              </motion.p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="shop-scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.25em]">
              Scroll
            </span>
            <div className="w-5 h-8 rounded-full border border-gold/30 flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-1 h-1 rounded-full bg-gold"
              />
            </div>
          </div>

          {/* Decorative corners */}
          <div className="shop-corner absolute top-6 left-6 w-10 h-10 border-l border-t border-gold/15 z-10" />
          <div className="shop-corner absolute top-6 right-6 w-10 h-10 border-r border-t border-gold/15 z-10" />
          <div className="shop-corner absolute bottom-6 left-6 w-10 h-10 border-l border-b border-gold/15 z-10" />
          <div className="shop-corner absolute bottom-6 right-6 w-10 h-10 border-r border-b border-gold/15 z-10" />
        </div>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <div className="relative z-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 pt-20"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">
              {t('Nos produits', 'Our products')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('Decouvrez la', 'Discover the')}{' '}
              <span className="text-gold">{t('collection', 'collection')}</span>
            </h2>
          </motion.div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 bg-white/5 rounded w-16" />
                      <div className="h-9 bg-white/5 rounded-lg w-24" />
                    </div>
                  </div>
                </div>
              ))}
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
              <h2 className="text-xl font-semibold mb-3">
                {t('Aucun produit disponible', 'No products available')}
              </h2>
              <p className="text-gray-500">
                {t(
                  'Revenez bientot, notre catalogue sera mis a jour.',
                  'Come back soon, our catalog will be updated.'
                )}
              </p>
            </motion.div>
          )}

          {/* Grille de produits */}
          {!loading && products.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product) => {
                const outOfStock = product.stock <= 0
                const inCart =
                  cartItems.find((c) => c.id === product.id)?.quantity || 0
                const maxReached = inCart >= product.stock
                const productName = pick(product.nameI18n ?? product.name)
                const productDescription = pick(
                  product.descriptionI18n ?? product.description
                )
                return (
                  <motion.div
                    key={product.id}
                    variants={item}
                    className="card group"
                  >
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
                            ? t(
                                `Stock max (${product.stock})`,
                                `Max stock (${product.stock})`
                              )
                            : t('Ajouter au panier', 'Add to cart')}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
