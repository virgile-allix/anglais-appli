'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllOrders,
  getAllUsers,
  getProducts,
  updateOrderStatus,
  setUserAdmin,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getAllTickets,
  addTicketMessage,
  updateTicketStatus,
  type Order,
  type Product,
  type UserProfile,
  type PromoCode,
  type Ticket,
} from '@/lib/firestore'

const STATUS_OPTIONS: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered']
const STATUS_LABELS: Record<Order['status'], { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10' },
  paid: { label: 'Payee', color: 'text-green-400 bg-green-400/10' },
  shipped: { label: 'Expediee', color: 'text-blue-400 bg-blue-400/10' },
  delivered: { label: 'Livree', color: 'text-gray-400 bg-gray-400/10' },
}

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'promos' | 'support'

const TICKET_STATUS_LABELS: Record<Ticket['status'], { label: string; color: string }> = {
  open: { label: 'Ouvert', color: 'text-green-400 bg-green-400/10' },
  in_progress: { label: 'En cours', color: 'text-yellow-400 bg-yellow-400/10' },
  closed: { label: 'Ferme', color: 'text-gray-400 bg-gray-400/10' },
}
const TICKET_STATUS_OPTIONS: Ticket['status'][] = ['open', 'in_progress', 'closed']

type ProductForm = {
  name: string
  price: string
  description: string
  image: string
  category: string
  stock: string
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  price: '',
  description: '',
  image: '',
  category: 'general',
  stock: '0',
}

type PromoForm = {
  code: string
  discount: string
  usageLimit: string
  active: boolean
}

const EMPTY_PROMO: PromoForm = {
  code: '',
  discount: '',
  usageLimit: '0',
  active: true,
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [promoForm, setPromoForm] = useState<PromoForm>(EMPTY_PROMO)
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchProduct, setSearchProduct] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all')
  const [openTicketId, setOpenTicketId] = useState<string | null>(null)
  const [ticketReply, setTicketReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filterTicketStatus, setFilterTicketStatus] = useState<Ticket['status'] | 'all'>('all')

  const isAdmin = Boolean(profile?.isAdmin)

  useEffect(() => {
    if (!error && !success) return
    const t = setTimeout(() => { setError(''); setSuccess('') }, 4000)
    return () => clearTimeout(t)
  }, [error, success])

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

    Promise.all([getProducts(), getAllOrders(), getAllUsers(), getPromoCodes(), getAllTickets()])
      .then(([p, o, u, pc, tk]) => {
        setProducts(p)
        setOrders(o)
        setUsers(u)
        setPromoCodes(pc)
        setTickets(tk)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur chargement')
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, isAdmin, router])

  /* ─── Stats ─── */

  const stats = useMemo(() => {
    const ordersByStatus = { pending: 0, paid: 0, shipped: 0, delivered: 0 }
    let totalRevenue = 0
    let todayRevenue = 0
    let todayOrders = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const order of orders) {
      ordersByStatus[order.status] += 1
      if (order.status !== 'pending') {
        totalRevenue += order.total
      }
      if (order.createdAt >= today) {
        todayOrders += 1
        if (order.status !== 'pending') todayRevenue += order.total
      }
    }

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
    const outOfStock = products.filter((p) => p.stock <= 0).length

    return {
      ordersByStatus,
      totalRevenue,
      todayRevenue,
      todayOrders,
      totalProducts: products.length,
      totalStock,
      outOfStock,
      totalUsers: users.length,
      totalOrders: orders.length,
      activePromos: promoCodes.filter((p) => p.active).length,
      openTickets: tickets.filter((t) => t.status === 'open').length,
      totalTickets: tickets.length,
    }
  }, [orders, products, users, promoCodes, tickets])

  /* ─── Filtered data ─── */

  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return products
    const q = searchProduct.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [products, searchProduct])

  const filteredOrders = useMemo(() => {
    let result = orders
    if (filterStatus !== 'all') {
      result = result.filter((o) => o.status === filterStatus)
    }
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase()
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.uid.toLowerCase().includes(q) ||
          o.paymentId?.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, filterStatus, searchOrder])

  /* ─── Product CRUD ─── */

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT)
    setEditingProductId(null)
  }

  const startEditProduct = (p: Product) => {
    setProductForm({
      name: p.name,
      price: String(p.price),
      description: p.description,
      image: p.image,
      category: p.category,
      stock: String(p.stock ?? 0),
    })
    setEditingProductId(p.id)
    setActiveTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const price = Number(productForm.price)
    const stock = Number(productForm.stock)
    if (!productForm.name.trim()) { setError('Nom requis.'); return }
    if (Number.isNaN(price) || price < 0) { setError('Prix invalide.'); return }
    if (Number.isNaN(stock) || stock < 0) { setError('Stock invalide.'); return }

    setSaving(true)
    const data = {
      name: productForm.name.trim(),
      price,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      category: productForm.category.trim() || 'general',
      stock: Math.floor(stock),
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data)
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...data } : p)))
        setSuccess(`"${data.name}" mis a jour.`)
      } else {
        const id = await createProduct(data)
        setProducts((prev) => [{ id, ...data }, ...prev])
        setSuccess(`"${data.name}" cree.`)
      }
      resetProductForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur produit')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      if (editingProductId === id) resetProductForm()
      setSuccess('Produit supprime.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    }
  }

  /* ─── Order status ─── */

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur commande')
    }
  }

  /* ─── User admin toggle ─── */

  const handleToggleAdmin = async (uid: string, current: boolean) => {
    const action = current ? 'retirer les droits admin' : 'donner les droits admin'
    if (!confirm(`Voulez-vous ${action} a cet utilisateur ?`)) return
    try {
      await setUserAdmin(uid, !current)
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, isAdmin: !current } : u)))
      setSuccess(`Droits mis a jour.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur modification role')
    }
  }

  /* ─── Promo CRUD ─── */

  const resetPromoForm = () => {
    setPromoForm(EMPTY_PROMO)
    setEditingPromoId(null)
  }

  const startEditPromo = (p: PromoCode) => {
    setPromoForm({
      code: p.code,
      discount: String(p.discount),
      usageLimit: String(p.usageLimit),
      active: p.active,
    })
    setEditingPromoId(p.id)
  }

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const discount = Number(promoForm.discount)
    const usageLimit = Number(promoForm.usageLimit)
    if (!promoForm.code.trim()) { setError('Code requis.'); return }
    if (Number.isNaN(discount) || discount <= 0 || discount > 100) { setError('Reduction entre 1 et 100%.'); return }

    setSaving(true)
    const data = {
      code: promoForm.code.trim().toUpperCase(),
      discount,
      usageLimit: Math.floor(usageLimit) || 0,
      active: promoForm.active,
    }

    try {
      if (editingPromoId) {
        await updatePromoCode(editingPromoId, data)
        setPromoCodes((prev) => prev.map((p) => (p.id === editingPromoId ? { ...p, ...data } : p)))
        setSuccess(`Code "${data.code}" mis a jour.`)
      } else {
        const id = await createPromoCode(data)
        setPromoCodes((prev) => [{ id, ...data, usageCount: 0, createdAt: new Date() }, ...prev])
        setSuccess(`Code "${data.code}" cree.`)
      }
      resetPromoForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur promo')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    try {
      await deletePromoCode(id)
      setPromoCodes((prev) => prev.filter((p) => p.id !== id))
      if (editingPromoId === id) resetPromoForm()
      setSuccess('Code promo supprime.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur suppression promo')
    }
  }

  const handleTogglePromoActive = async (id: string, current: boolean) => {
    try {
      await updatePromoCode(id, { active: !current })
      setPromoCodes((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur promo')
    }
  }

  /* ─── Tickets ─── */

  const filteredTickets = useMemo(() => {
    if (filterTicketStatus === 'all') return tickets
    return tickets.filter((t) => t.status === filterTicketStatus)
  }, [tickets, filterTicketStatus])

  const handleTicketReply = async (ticketId: string) => {
    if (!ticketReply.trim() || !profile) return
    setSendingReply(true)
    try {
      await addTicketMessage(ticketId, {
        sender: 'admin',
        senderEmail: profile.email,
        text: ticketReply.trim(),
      })
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  { sender: 'admin' as const, senderEmail: profile.email, text: ticketReply.trim(), createdAt: new Date() },
                ],
                updatedAt: new Date(),
              }
            : t
        )
      )
      setTicketReply('')
      setSuccess('Reponse envoyee.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur envoi reponse')
    } finally {
      setSendingReply(false)
    }
  }

  const handleTicketStatusChange = async (ticketId: string, status: Ticket['status']) => {
    try {
      await updateTicketStatus(ticketId, status)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur statut ticket')
    }
  }

  /* ─── Guards ─── */

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
          <h1 className="text-2xl font-bold mb-3">Acces refuse</h1>
          <p className="text-gray-500">Vous n&apos;avez pas les droits administrateur.</p>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: `Produits (${products.length})` },
    { key: 'orders', label: `Commandes (${orders.length})` },
    { key: 'users', label: `Utilisateurs (${users.length})` },
    { key: 'promos', label: `Promos (${promoCodes.length})` },
    { key: 'support', label: `Support (${tickets.filter((t) => t.status !== 'closed').length})` },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Espace <span className="text-gold">Admin</span></h1>
          <p className="text-gray-500 mt-1">Gerez votre boutique en ligne.</p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ DASHBOARD ═══════ */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {/* Stats principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Revenu total</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalRevenue.toFixed(2)} &euro;</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Revenu aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.todayRevenue.toFixed(2)} &euro;</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Commandes du jour</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.todayOrders}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Utilisateurs</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Stats commandes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Commandes par statut</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_LABELS[status].color}`}>
                      {STATUS_LABELS[status].label}
                    </span>
                    <span className="text-lg font-bold">{stats.ordersByStatus[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats produits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Produits en catalogue</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalProducts}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Stock total</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalStock}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">En rupture</p>
                <p className={`text-2xl font-bold mt-1 ${stats.outOfStock > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.outOfStock}
                </p>
              </div>
            </div>

            {/* Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Codes promo actifs</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.activePromos}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tickets ouverts</p>
                <p className={`text-2xl font-bold mt-1 ${stats.openTickets > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {stats.openTickets} <span className="text-sm text-gray-500 font-normal">/ {stats.totalTickets}</span>
                </p>
              </div>
            </div>

            {/* Dernières commandes */}
            {orders.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Dernieres commandes</h2>
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[order.status].color}`}>
                          {STATUS_LABELS[order.status].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gold font-semibold">{order.total.toFixed(2)} &euro;</span>
                        <span className="text-xs text-gray-600">{order.createdAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-gold hover:text-gold-light mt-3 transition-colors">
                  Voir toutes les commandes &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ PRODUITS ═══════ */}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            {/* Formulaire */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingProductId ? 'Modifier le produit' : 'Creer un produit'}</h2>
                {editingProductId && (
                  <button onClick={resetProductForm} className="text-sm text-gray-500 hover:text-white transition-colors">Annuler</button>
                )}
              </div>
              <form onSubmit={handleProductSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Nom *</label>
                  <input className="input-field" placeholder="Nom du produit" value={productForm.name}
                    onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Prix (EUR) *</label>
                  <input className="input-field" placeholder="0.00" type="number" step="0.01" min="0"
                    value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Image URL</label>
                  <input className="input-field" placeholder="https://..." value={productForm.image}
                    onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Categorie</label>
                  <input className="input-field" placeholder="general" value={productForm.category}
                    onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Stock</label>
                  <input className="input-field" placeholder="0" type="number" min="0" value={productForm.stock}
                    onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Apercu</label>
                  <div className="input-field h-[42px] flex items-center overflow-hidden">
                    {productForm.image ? (
                      <img src={productForm.image} alt="Apercu" className="h-8 w-8 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="text-gray-600 text-sm">Aucune image</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
                  <textarea className="input-field" placeholder="Description du produit..." value={productForm.description}
                    onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2 disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : editingProductId ? 'Mettre a jour' : 'Ajouter le produit'}
                </button>
              </form>
            </section>

            {/* Recherche */}
            <div className="flex gap-3">
              <input className="input-field flex-1" placeholder="Rechercher un produit..." value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)} />
            </div>

            {/* Liste */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Tous les produits ({filteredProducts.length})</h2>
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">Aucun produit trouve.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id}
                      className={`flex flex-col md:flex-row md:items-center gap-4 border-b border-white/5 pb-4 ${
                        editingProductId === product.id ? 'ring-1 ring-gold/30 rounded-lg p-3 -m-3 bg-gold/5' : ''
                      }`}>
                      <div className="w-14 h-14 bg-dark-tertiary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-gray-700">&#9670;</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate">{product.description || 'Pas de description'}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-gold font-semibold text-sm">{product.price.toFixed(2)} &euro;</span>
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{product.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${product.stock > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEditProduct(product)} className="btn-outline text-sm px-3">Modifier</button>
                        <button onClick={() => handleDeleteProduct(product.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* ═══════ COMMANDES ═══════ */}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input className="input-field flex-1" placeholder="Rechercher (ID, UID, paiement)..."
                value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
              <select className="input-field w-auto" value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Order['status'] | 'all')}>
                <option value="all">Tous les statuts</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                ))}
              </select>
            </div>

            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Commandes ({filteredOrders.length})</h2>
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">Aucune commande trouvee.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border-b border-white/5 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[order.status].color}`}>
                              {STATUS_LABELS[order.status].label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{order.uid}</p>
                          <p className="text-xs text-gray-600">{order.paymentMethod || 'n/a'} &middot; {order.paymentId || 'n/a'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gold font-semibold">{order.total.toFixed(2)} &euro;</span>
                          <select className="input-field text-sm" value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}>
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2 ml-4 text-xs text-gray-500 flex flex-col gap-0.5">
                        {order.items.map((item) => (
                          <span key={item.id}>{item.name} x{item.quantity} &mdash; {(item.price * item.quantity).toFixed(2)} &euro;</span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{order.createdAt.toLocaleString('fr-FR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* ═══════ UTILISATEURS ═══════ */}
        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Utilisateurs ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">Aucun utilisateur.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {users.map((u) => (
                    <div key={u.uid} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                      <div>
                        <p className="text-sm text-gray-200">{u.email || u.uid}</p>
                        <p className="text-xs text-gray-500 font-mono">{u.uid}</p>
                        <p className="text-xs text-gray-600">Inscrit le {u.createdAt.toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${u.isAdmin ? 'bg-gold/20 text-gold' : 'bg-gray-500/20 text-gray-400'}`}>
                          {u.isAdmin ? 'Admin' : 'Client'}
                        </span>
                        {u.uid !== user?.uid && (
                          <button
                            onClick={() => handleToggleAdmin(u.uid, u.isAdmin)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                              u.isAdmin
                                ? 'border border-red-500/20 text-red-400 hover:bg-red-500/10'
                                : 'border border-gold/20 text-gold hover:bg-gold/10'
                            }`}
                          >
                            {u.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* ═══════ PROMOS ═══════ */}
        {activeTab === 'promos' && (
          <motion.div key="promos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            {/* Formulaire */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingPromoId ? 'Modifier le code' : 'Creer un code promo'}</h2>
                {editingPromoId && (
                  <button onClick={resetPromoForm} className="text-sm text-gray-500 hover:text-white transition-colors">Annuler</button>
                )}
              </div>
              <form onSubmit={handlePromoSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Code *</label>
                  <input className="input-field uppercase" placeholder="PROMO20" value={promoForm.code}
                    onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Reduction (%) *</label>
                  <input className="input-field" placeholder="10" type="number" min="1" max="100" value={promoForm.discount}
                    onChange={(e) => setPromoForm((f) => ({ ...f, discount: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Limite d&apos;utilisation (0 = illimite)</label>
                  <input className="input-field" placeholder="0" type="number" min="0" value={promoForm.usageLimit}
                    onChange={(e) => setPromoForm((f) => ({ ...f, usageLimit: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Statut</label>
                  <div className="input-field h-[42px] flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={promoForm.active}
                        onChange={(e) => setPromoForm((f) => ({ ...f, active: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-600 text-gold focus:ring-gold bg-dark-tertiary" />
                      <span className="text-sm">{promoForm.active ? 'Actif' : 'Inactif'}</span>
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2 disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : editingPromoId ? 'Mettre a jour' : 'Creer le code promo'}
                </button>
              </form>
            </section>

            {/* Liste */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Codes promo ({promoCodes.length})</h2>
              {promoCodes.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">Aucun code promo.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {promoCodes.map((promo) => (
                    <div key={promo.id} className={`flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3 ${
                      editingPromoId === promo.id ? 'ring-1 ring-gold/30 rounded-lg p-3 -m-3 bg-gold/5' : ''
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gold">{promo.code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${promo.active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            {promo.active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          -{promo.discount}% &middot; {promo.usageCount}/{promo.usageLimit || '&infin;'} utilisations
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleTogglePromoActive(promo.id, promo.active)}
                          className="btn-outline text-sm px-3">
                          {promo.active ? 'Desactiver' : 'Activer'}
                        </button>
                        <button onClick={() => startEditPromo(promo)} className="btn-outline text-sm px-3">Modifier</button>
                        <button onClick={() => handleDeletePromo(promo.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* ═══════ SUPPORT ═══════ */}
        {activeTab === 'support' && (
          <motion.div key="support" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {/* Filtre */}
            <div className="flex gap-3">
              <select className="input-field w-auto" value={filterTicketStatus}
                onChange={(e) => { setFilterTicketStatus(e.target.value as Ticket['status'] | 'all'); setOpenTicketId(null) }}>
                <option value="all">Tous les tickets</option>
                {TICKET_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{TICKET_STATUS_LABELS[s].label}</option>
                ))}
              </select>
            </div>

            {/* Conversation ouverte */}
            {openTicketId && (() => {
              const ticket = tickets.find((t) => t.id === openTicketId)
              if (!ticket) return null
              return (
                <div className="flex flex-col gap-4">
                  <button onClick={() => { setOpenTicketId(null); setTicketReply('') }}
                    className="text-sm text-gray-500 hover:text-white transition-colors self-start">
                    &larr; Retour
                  </button>
                  <div className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{ticket.subject}</h2>
                        <p className="text-xs text-gray-500">
                          {ticket.email} &middot; #{ticket.id.slice(0, 8)} &middot; {ticket.createdAt.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <select className="input-field text-sm w-auto" value={ticket.status}
                        onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value as Ticket['status'])}>
                        {TICKET_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{TICKET_STATUS_LABELS[s].label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Messages */}
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4 border-t border-white/5 pt-4">
                      {ticket.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                            msg.sender === 'admin'
                              ? 'bg-gold/20 text-white rounded-br-md'
                              : 'bg-white/10 text-gray-200 rounded-bl-md'
                          }`}>
                            <p className="text-xs text-gray-500 mb-1">
                              {msg.sender === 'admin' ? 'Vous (Admin)' : msg.senderEmail || 'Client'} &middot; {msg.createdAt.toLocaleString('fr-FR')}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Repondre */}
                    <div className="flex gap-2">
                      <textarea className="input-field flex-1" placeholder="Votre reponse..." value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)} rows={2} />
                      <button onClick={() => handleTicketReply(ticket.id)} disabled={sendingReply || !ticketReply.trim()}
                        className="btn-primary px-6 self-end disabled:opacity-50">
                        {sendingReply ? '...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Liste tickets */}
            {!openTicketId && (
              <section className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Tickets ({filteredTickets.length})</h2>
                {filteredTickets.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">Aucun ticket.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredTickets.map((ticket) => {
                      const lastMsg = ticket.messages[ticket.messages.length - 1]
                      const unread = lastMsg?.sender === 'client'
                      return (
                        <button key={ticket.id} onClick={() => setOpenTicketId(ticket.id)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 text-left hover:bg-white/5 rounded-lg p-3 -m-3 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{ticket.subject}</p>
                              {unread && (
                                <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{ticket.email}</p>
                            <p className="text-xs text-gray-600 truncate mt-0.5">{lastMsg?.text || ''}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {ticket.messages.length} msg &middot; {ticket.updatedAt.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${TICKET_STATUS_LABELS[ticket.status].color}`}>
                            {TICKET_STATUS_LABELS[ticket.status].label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
