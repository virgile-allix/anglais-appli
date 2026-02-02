'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  createProduct,
  deleteProduct,
  getAllOrders,
  getAllUsers,
  getProducts,
  updateOrderStatus,
  type Order,
  type Product,
  type UserProfile,
} from '@/lib/firestore'

const STATUS_OPTIONS: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered']

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'general',
  })

  const isAdmin = Boolean(profile?.isAdmin)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (authLoading) return
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    Promise.all([getProducts(), getAllOrders(), getAllUsers()])
      .then(([productsData, ordersData, usersData]) => {
        setProducts(productsData)
        setOrders(ordersData)
        setUsers(usersData)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur admin')
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, isAdmin, router])

  const orderStats = useMemo(() => {
    const totals = { pending: 0, paid: 0, shipped: 0, delivered: 0 }
    for (const order of orders) {
      totals[order.status] += 1
    }
    return totals
  }, [orders])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const price = Number(newProduct.price)
    if (!newProduct.name || Number.isNaN(price)) {
      setError('Nom et prix requis.')
      return
    }

    try {
      const id = await createProduct({
        name: newProduct.name.trim(),
        price,
        description: newProduct.description.trim(),
        image: newProduct.image.trim(),
        category: newProduct.category.trim() || 'general',
      })

      setProducts((prev) => [
        {
          id,
          name: newProduct.name.trim(),
          price,
          description: newProduct.description.trim(),
          image: newProduct.image.trim(),
          category: newProduct.category.trim() || 'general',
        },
        ...prev,
      ])

      setNewProduct({ name: '', price: '', description: '', image: '', category: 'general' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur création produit')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur suppression produit')
    }
  }

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur mise à jour commande')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Accès refusé</h1>
          <p className="text-gray-500">Vous n'avez pas les droits admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Espace Admin</h1>
          <p className="text-gray-500">Gérez produits, commandes et utilisateurs.</p>
        </motion.div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="card p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{status}</p>
              <p className="text-2xl font-bold text-gold">{orderStats[status]}</p>
            </div>
          ))}
        </div>

        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Créer un produit</h2>
          <form onSubmit={handleCreateProduct} className="grid gap-4 md:grid-cols-2">
            <input
              className="input-field"
              placeholder="Nom"
              value={newProduct.name}
              onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Prix"
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Catégorie"
              value={newProduct.category}
              onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
            />
            <textarea
              className="input-field md:col-span-2"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
            <button type="submit" className="btn-primary md:col-span-2">
              Ajouter le produit
            </button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Produits ({products.length})</h2>
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.price.toFixed(2)} € · {product.category || 'general'}</p>
                </div>
                <button onClick={() => handleDeleteProduct(product.id)} className="btn-outline">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Commandes ({orders.length})</h2>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border-b border-white/5 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-400">{order.uid}</p>
                    <p className="text-sm text-gray-500">{order.paymentMethod || 'n/a'} · {order.paymentId || 'n/a'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-semibold">{order.total.toFixed(2)} €</span>
                    <select
                      className="input-field"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {order.createdAt.toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Utilisateurs ({users.length})</h2>
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u.uid} className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm text-gray-200">{u.email || u.uid}</p>
                  <p className="text-xs text-gray-500">{u.uid}</p>
                </div>
                <span className={	ext-xs font-semibold px-3 py-1 rounded-full }>
                  {u.isAdmin ? 'Admin' : 'Client'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}