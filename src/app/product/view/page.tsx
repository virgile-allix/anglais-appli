'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { getProductById, getProducts, type Product } from '@/lib/firestore'
import ProductViewer3D from '@/components/ProductViewer3D'

function ProductDetailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const productId = searchParams.get('id')

    const { addItem, items: cartItems } = useCart()
    const [product, setProduct] = useState<Product | null>(null)
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'image' | '3d'>('image')
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (!productId) return

        Promise.all([
            getProductById(productId),
            getProducts()
        ]).then(([p, allProducts]) => {
            if (!p) {
                router.push('/shop')
                return
            }
            setProduct(p)
            // Produits similaires (meme categorie, max 4)
            const related = allProducts
                .filter((pr) => pr.id !== p.id && pr.category === p.category)
                .slice(0, 4)
            setRelatedProducts(related)
        }).finally(() => setLoading(false))
    }, [productId, router])

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

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
        <div className="min-h-screen pt-24 pb-16 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
                    <span className="mx-2">/</span>
                    <Link href="/shop" className="hover:text-gold transition-colors">Boutique</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Image / 3D Viewer */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        {/* Tabs si modele 3D disponible */}
                        {product.model3d && (
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setActiveTab('image')}
                                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === 'image'
                                            ? 'bg-gold text-dark font-semibold'
                                            : 'bg-dark-tertiary text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Image
                                </button>
                                <button
                                    onClick={() => setActiveTab('3d')}
                                    className={`text-sm px-4 py-2 rounded-lg transition-colors ${activeTab === '3d'
                                            ? 'bg-gold text-dark font-semibold'
                                            : 'bg-dark-tertiary text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Vue 3D
                                </button>
                            </div>
                        )}

                        {/* Contenu image ou 3D */}
                        {activeTab === '3d' && product.model3d ? (
                            <ProductViewer3D modelUrl={product.model3d} className="aspect-square" />
                        ) : (
                            <div className="aspect-square bg-dark-tertiary rounded-2xl flex items-center justify-center overflow-hidden relative">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
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

                        {/* Bouton voir en 3D si pas de modele */}
                        {!product.model3d && (
                            <p className="text-xs text-gray-600 text-center mt-3">
                                Vue 3D non disponible pour ce produit
                            </p>
                        )}
                    </motion.div>

                    {/* Right: Details */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                        {/* Category badge */}
                        <span className="text-xs text-gold uppercase tracking-wider mb-2">{product.category}</span>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

                        {/* Price */}
                        <p className="text-3xl font-bold text-gold mb-6">{product.price.toFixed(2)} &euro;</p>

                        {/* Stock */}
                        <div className="flex items-center gap-2 mb-6">
                            {outOfStock ? (
                                <span className="text-sm text-red-400">Rupture de stock</span>
                            ) : product.stock <= 5 ? (
                                <span className="text-sm text-yellow-400">Plus que {product.stock} en stock</span>
                            ) : (
                                <span className="text-sm text-green-400">En stock ({product.stock} disponibles)</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {product.description || 'Aucune description disponible pour ce produit.'}
                            </p>
                        </div>

                        {/* Quantity + Add to cart */}
                        {!outOfStock && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400">Quantite</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock - inCart, quantity + 1))}
                                            disabled={quantity >= product.stock - inCart}
                                            className="w-10 h-10 rounded-lg bg-dark-tertiary text-gray-400 hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {inCart > 0 && (
                                        <span className="text-xs text-gray-500">({inCart} deja dans le panier)</span>
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

                        {/* Extra info */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Livraison 3-5 jours
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Retours 14 jours
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Paiement securise
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Stripe & PayPal
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-2xl font-bold mb-8">Produits <span className="text-gold">similaires</span></h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp.id}
                                    href={`/product/view?id=${rp.id}`}
                                    className="card group hover:border-gold/30 transition-colors"
                                >
                                    <div className="aspect-square bg-dark-tertiary flex items-center justify-center overflow-hidden">
                                        {rp.image ? (
                                            <img
                                                src={rp.image}
                                                alt={rp.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <span className="text-4xl text-gray-700">&#9670;</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold truncate">{rp.name}</h3>
                                        <p className="text-gold font-bold">{rp.price.toFixed(2)} &euro;</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default function ProductDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ProductDetailContent />
        </Suspense>
    )
}
