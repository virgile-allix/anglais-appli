'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { normalizeLocalizedText } from '@/lib/i18n'
import { apiFetch } from '@/lib/api'
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
const STATUS_LABELS: Record<Order['status'], { fr: string; en: string; color: string }> = {
  pending: { fr: 'En attente', en: 'Pending', color: 'text-yellow-400 bg-yellow-400/10' },
  paid: { fr: 'Payee', en: 'Paid', color: 'text-green-400 bg-green-400/10' },
  shipped: { fr: 'Expediee', en: 'Shipped', color: 'text-blue-400 bg-blue-400/10' },
  delivered: { fr: 'Livree', en: 'Delivered', color: 'text-gray-400 bg-gray-400/10' },
}

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'promos' | 'support'

const TICKET_STATUS_LABELS: Record<Ticket['status'], { fr: string; en: string; color: string }> = {
  open: { fr: 'Ouvert', en: 'Open', color: 'text-green-400 bg-green-400/10' },
  in_progress: { fr: 'En cours', en: 'In progress', color: 'text-yellow-400 bg-yellow-400/10' },
  closed: { fr: 'Ferme', en: 'Closed', color: 'text-gray-400 bg-gray-400/10' },
}
const TICKET_STATUS_OPTIONS: Ticket['status'][] = ['open', 'in_progress', 'closed']

type ProductForm = {
  name: string
  nameEn: string
  price: string
  description: string
  descriptionEn: string
  image: string
  category: string
  categoryEn: string
  stock: string
  model3d: string
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  nameEn: '',
  price: '',
  description: '',
  descriptionEn: '',
  image: '',
  category: 'general',
  categoryEn: 'general',
  stock: '0',
  model3d: '',
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
  const { t, pick, localeTag, locale } = useI18n()

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
  const [translating, setTranslating] = useState(false)
  const [translateOverwrite, setTranslateOverwrite] = useState(false)

  const isAdmin = Boolean(profile?.isAdmin)

  const statusLabel = (status: Order['status']) => locale === 'fr' ? STATUS_LABELS[status].fr : STATUS_LABELS[status].en
  const ticketStatusLabel = (status: Ticket['status']) => locale === 'fr' ? TICKET_STATUS_LABELS[status].fr : TICKET_STATUS_LABELS[status].en

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
        setError(err instanceof Error ? err.message : t('Erreur chargement', 'Loading error'))
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
        [
          p.name,
          p.description,
          p.category,
          p.nameI18n?.fr,
          p.nameI18n?.en,
          p.descriptionI18n?.fr,
          p.descriptionI18n?.en,
          p.categoryI18n?.fr,
          p.categoryI18n?.en,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
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
      nameEn: p.nameI18n?.en || p.name,
      price: String(p.price),
      description: p.description,
      descriptionEn: p.descriptionI18n?.en || p.description,
      image: p.image,
      category: p.category,
      categoryEn: p.categoryI18n?.en || p.category,
      stock: String(p.stock ?? 0),
      model3d: p.model3d || '',
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
    const nameFr = productForm.name.trim()
    const nameEn = productForm.nameEn.trim()
    const descriptionFr = productForm.description.trim()
    const descriptionEn = productForm.descriptionEn.trim()
    const categoryFr = productForm.category.trim() || 'general'
    const categoryEn = productForm.categoryEn.trim() || categoryFr
    if (!nameFr) { setError(t('Nom requis.', 'Name required.')); return }
    if (Number.isNaN(price) || price < 0) { setError(t('Prix invalide.', 'Invalid price.')); return }
    if (Number.isNaN(stock) || stock < 0) { setError(t('Stock invalide.', 'Invalid stock.')); return }

    setSaving(true)
    const data = {
      name: nameFr,
      nameI18n: normalizeLocalizedText(nameFr, nameEn),
      price,
      description: descriptionFr,
      descriptionI18n: normalizeLocalizedText(descriptionFr, descriptionEn),
      image: productForm.image.trim(),
      category: categoryFr,
      categoryI18n: normalizeLocalizedText(categoryFr, categoryEn),
      stock: Math.floor(stock),
      model3d: productForm.model3d.trim(),
    }

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data)
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...data } : p)))
        setSuccess(t(`"${data.name}" mis a jour.`, `"${data.name}" updated.`))
      } else {
        const id = await createProduct(data)
        setProducts((prev) => [{ id, ...data }, ...prev])
        setSuccess(t(`"${data.name}" cree.`, `"${data.name}" created.`))
      }
      resetProductForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur produit', 'Product error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('Supprimer ce produit ?', 'Delete this product?'))) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      if (editingProductId === id) resetProductForm()
      setSuccess(t('Produit supprime.', 'Product deleted.'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur suppression', 'Delete error'))
    }
  }

  /* ─── Order status ─── */

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur commande', 'Order error'))
    }
  }

  /* ─── User admin toggle ─── */

  const handleToggleAdmin = async (uid: string, current: boolean) => {
    const action = current
      ? t('retirer les droits admin', 'remove admin rights')
      : t('donner les droits admin', 'grant admin rights')
    if (!confirm(t(`Voulez-vous ${action} a cet utilisateur ?`, `Do you want to ${action} for this user?`))) return
    try {
      await setUserAdmin(uid, !current)
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, isAdmin: !current } : u)))
      setSuccess(t('Droits mis a jour.', 'Rights updated.'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur modification role', 'Role update error'))
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
    if (!promoForm.code.trim()) { setError(t('Code requis.', 'Code required.')); return }
    if (Number.isNaN(discount) || discount <= 0 || discount > 100) { setError(t('Reduction entre 1 et 100%.', 'Discount must be between 1 and 100%.')); return }

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
        setSuccess(t(`Code "${data.code}" mis a jour.`, `Code "${data.code}" updated.`))
      } else {
        const id = await createPromoCode(data)
        setPromoCodes((prev) => [{ id, ...data, usageCount: 0, createdAt: new Date() }, ...prev])
        setSuccess(t(`Code "${data.code}" cree.`, `Code "${data.code}" created.`))
      }
      resetPromoForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur promo', 'Promo error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm(t('Supprimer ce code promo ?', 'Delete this promo code?'))) return
    try {
      await deletePromoCode(id)
      setPromoCodes((prev) => prev.filter((p) => p.id !== id))
      if (editingPromoId === id) resetPromoForm()
      setSuccess(t('Code promo supprime.', 'Promo code deleted.'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur suppression promo', 'Promo delete error'))
    }
  }

  const handleTogglePromoActive = async (id: string, current: boolean) => {
    try {
      await updatePromoCode(id, { active: !current })
      setPromoCodes((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur promo', 'Promo error'))
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
      setSuccess(t('Reponse envoyee.', 'Reply sent.'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur envoi reponse', 'Reply error'))
    } finally {
      setSendingReply(false)
    }
  }

  const handleTicketStatusChange = async (ticketId: string, status: Ticket['status']) => {
    try {
      await updateTicketStatus(ticketId, status)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur statut ticket', 'Ticket status error'))
    }
  }

  /* --- Traduction automatique (produits) --- */

  const handleTranslateProducts = async () => {
    if (!user) return
    setTranslating(true)
    setError('')
    setSuccess('')
    try {
      const token = await user.getIdToken()
      const result = await apiFetch<{ updated: number; total: number }>('/translate/products', {
        method: 'POST',
        body: { overwrite: translateOverwrite },
        token,
      })
      setSuccess(
        t(`Traduction terminee: ${result.updated}/${result.total} produits mis a jour.`, `Translation complete: ${result.updated}/${result.total} products updated.`)
      )
      const refreshed = await getProducts()
      setProducts(refreshed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('Erreur traduction', 'Translation error'))
    } finally {
      setTranslating(false)
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
          <h1 className="text-2xl font-bold mb-3">{t('Acces refuse', 'Access denied')}</h1>
          <p className="text-gray-500">{t('Vous n\'avez pas les droits administrateur.', 'You do not have administrator rights.')}</p>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: `${t('Produits', 'Products')} (${products.length})` },
    { key: 'orders', label: `${t('Commandes', 'Orders')} (${orders.length})` },
    { key: 'users', label: `${t('Utilisateurs', 'Users')} (${users.length})` },
    { key: 'promos', label: `Promos (${promoCodes.length})` },
    { key: 'support', label: `Support (${tickets.filter((t) => t.status !== 'closed').length})` },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">{t('Espace', 'Admin')} <span className="text-gold">{t('Admin', 'Panel')}</span></h1>
          <p className="text-gray-500 mt-1">{t('Gerez votre boutique en ligne.', 'Manage your online store.')}</p>
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Revenu total', 'Total revenue')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalRevenue.toFixed(2)} &euro;</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Revenu aujourd\'hui', 'Today\'s revenue')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.todayRevenue.toFixed(2)} &euro;</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Commandes du jour', 'Today\'s orders')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.todayOrders}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Utilisateurs', 'Users')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalUsers}</p>
              </div>
            </div>

            {/* Stats commandes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">{t('Commandes par statut', 'Orders by status')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_LABELS[status].color}`}>
                      {statusLabel(status)}
                    </span>
                    <span className="text-lg font-bold">{stats.ordersByStatus[status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats produits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Produits en catalogue', 'Products in catalog')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalProducts}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Stock total', 'Total stock')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.totalStock}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('En rupture', 'Out of stock')}</p>
                <p className={`text-2xl font-bold mt-1 ${stats.outOfStock > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.outOfStock}
                </p>
              </div>
            </div>

            {/* Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Codes promo actifs', 'Active promo codes')}</p>
                <p className="text-2xl font-bold text-gold mt-1">{stats.activePromos}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('Tickets ouverts', 'Open tickets')}</p>
                <p className={`text-2xl font-bold mt-1 ${stats.openTickets > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {stats.openTickets} <span className="text-sm text-gray-500 font-normal">/ {stats.totalTickets}</span>
                </p>
              </div>
            </div>

            {/* Dernières commandes */}
            {orders.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">{t('Dernieres commandes', 'Recent orders')}</h2>
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[order.status].color}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gold font-semibold">{order.total.toFixed(2)} &euro;</span>
                        <span className="text-xs text-gray-600">{order.createdAt.toLocaleDateString(localeTag)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-gold hover:text-gold-light mt-3 transition-colors">
                  {t('Voir toutes les commandes', 'View all orders')} &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ PRODUITS ═══════ */}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <section className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{t('Traduction automatique', 'Automatic translation')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('Ajoute automatiquement les versions EN des noms, descriptions et categories des produits.', 'Automatically adds EN versions of product names, descriptions and categories.')}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={translateOverwrite}
                      onChange={(e) => setTranslateOverwrite(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-gold focus:ring-gold bg-dark-tertiary"
                    />
                    {t('Ecraser les traductions existantes', 'Overwrite existing translations')}
                  </label>
                  <button
                    onClick={handleTranslateProducts}
                    disabled={translating}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {translating ? t('Traduction en cours...', 'Translating...') : t('Traduire tous les produits', 'Translate all products')}
                  </button>
                </div>
              </div>
            </section>

            {/* Formulaire */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingProductId ? t('Modifier le produit', 'Edit product') : t('Creer un produit', 'Create product')}</h2>
                {editingProductId && (
                  <button onClick={resetProductForm} className="text-sm text-gray-500 hover:text-white transition-colors">{t('Annuler', 'Cancel')}</button>
                )}
              </div>
              <form onSubmit={handleProductSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Nom (FR) *', 'Name (FR) *')}</label>
                  <input className="input-field" placeholder={t('Nom du produit', 'Product name')} value={productForm.name}
                    onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Nom (EN)', 'Name (EN)')}</label>
                  <input className="input-field" placeholder={t('Nom en anglais', 'Name in English')} value={productForm.nameEn}
                    onChange={(e) => setProductForm((f) => ({ ...f, nameEn: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Prix (EUR) *', 'Price (EUR) *')}</label>
                  <input className="input-field" placeholder="0.00" type="number" step="0.01" min="0"
                    value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Stock</label>
                  <input className="input-field" placeholder="0" type="number" min="0" value={productForm.stock}
                    onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Image URL', 'Image URL')}</label>
                  <input className="input-field" placeholder="https://..." value={productForm.image}
                    onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Modele 3D (GLB URL)', '3D model (GLB URL)')}</label>
                  <input className="input-field" placeholder="https://...model.glb" value={productForm.model3d}
                    onChange={(e) => setProductForm((f) => ({ ...f, model3d: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Categorie (FR)', 'Category (FR)')}</label>
                  <input className="input-field" placeholder="general" value={productForm.category}
                    onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Categorie (EN)', 'Category (EN)')}</label>
                  <input className="input-field" placeholder="general" value={productForm.categoryEn}
                    onChange={(e) => setProductForm((f) => ({ ...f, categoryEn: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Description (FR)', 'Description (FR)')}</label>
                  <textarea className="input-field" placeholder={t('Description du produit...', 'Product description...')} value={productForm.description}
                    onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Description (EN)', 'Description (EN)')}</label>
                  <textarea className="input-field" placeholder={t('Description en anglais...', 'Description in English...')} value={productForm.descriptionEn}
                    onChange={(e) => setProductForm((f) => ({ ...f, descriptionEn: e.target.value }))} rows={3} />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Apercu', 'Preview')}</label>
                  <div className="input-field h-[42px] flex items-center gap-3 overflow-hidden">
                    {productForm.image ? (
                      <img src={productForm.image} alt={t('Apercu', 'Preview')} className="h-8 w-8 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span className="text-gray-600 text-sm">{t('Aucune image', 'No image')}</span>
                    )}
                    {productForm.model3d && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">3D</span>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2 disabled:opacity-50">
                  {saving ? t('Sauvegarde...', 'Saving...') : editingProductId ? t('Mettre a jour', 'Update') : t('Ajouter le produit', 'Add product')}
                </button>
              </form>
            </section>

            {/* Recherche */}
            <div className="flex gap-3">
              <input className="input-field flex-1" placeholder={t('Rechercher un produit...', 'Search product...')} value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)} />
            </div>

            {/* Liste */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('Tous les produits', 'All products')} ({filteredProducts.length})</h2>
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">{t('Aucun produit trouve.', 'No product found.')}</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id}
                      className={`flex flex-col md:flex-row md:items-center gap-4 border-b border-white/5 pb-4 ${
                        editingProductId === product.id ? 'ring-1 ring-gold/30 rounded-lg p-3 -m-3 bg-gold/5' : ''
                      }`}>
                      <div className="w-14 h-14 bg-dark-tertiary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={pick(product.nameI18n ?? product.name)} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-gray-700">&#9670;</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{pick(product.nameI18n ?? product.name)}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {pick(product.descriptionI18n ?? product.description, t('Pas de description', 'No description'))}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-gold font-semibold text-sm">{product.price.toFixed(2)} &euro;</span>
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                            {pick(product.categoryI18n ?? product.category)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${product.stock > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            Stock: {product.stock}
                          </span>
                          {product.model3d && (
                            <span className="text-xs px-2 py-0.5 rounded text-gold bg-gold/10">3D</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEditProduct(product)} className="btn-outline text-sm px-3">{t('Modifier', 'Edit')}</button>
                        <button onClick={() => handleDeleteProduct(product.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          {t('Supprimer', 'Delete')}
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
              <input className="input-field flex-1" placeholder={t('Rechercher (ID, UID, paiement)...', 'Search (ID, UID, payment)...')}
                value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} />
              <select className="input-field w-auto" value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Order['status'] | 'all')}>
                <option value="all">{t('Tous les statuts', 'All statuses')}</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('Commandes', 'Orders')} ({filteredOrders.length})</h2>
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">{t('Aucune commande trouvee.', 'No order found.')}</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border-b border-white/5 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_LABELS[order.status].color}`}>
                              {statusLabel(order.status)}
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
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2 ml-4 text-xs text-gray-500 flex flex-col gap-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-0.5">
                            <span>
                              {pick(item.nameI18n ?? item.name)} x{item.quantity} &mdash; {(item.price * item.quantity).toFixed(2)} &euro;
                            </span>
                            {item.modelUrl && (
                              <a
                                href={item.modelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-gold hover:text-gold-light transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t('Telecharger le modele 3D', 'Download 3D model')}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{order.createdAt.toLocaleString(localeTag)}</p>
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
              <h2 className="text-xl font-semibold mb-4">{t('Utilisateurs', 'Users')} ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">{t('Aucun utilisateur.', 'No user.')}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {users.map((u) => (
                    <div key={u.uid} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                      <div>
                        <p className="text-sm text-gray-200">{u.email || u.uid}</p>
                        <p className="text-xs text-gray-500 font-mono">{u.uid}</p>
                        <p className="text-xs text-gray-600">{t('Inscrit le', 'Registered on')} {u.createdAt.toLocaleDateString(localeTag)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${u.isAdmin ? 'bg-gold/20 text-gold' : 'bg-gray-500/20 text-gray-400'}`}>
                          {u.isAdmin ? 'Admin' : t('Client', 'Customer')}
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
                            {u.isAdmin ? t('Retirer admin', 'Remove admin') : t('Rendre admin', 'Make admin')}
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
                <h2 className="text-xl font-semibold">{editingPromoId ? t('Modifier le code', 'Edit code') : t('Creer un code promo', 'Create promo code')}</h2>
                {editingPromoId && (
                  <button onClick={resetPromoForm} className="text-sm text-gray-500 hover:text-white transition-colors">{t('Annuler', 'Cancel')}</button>
                )}
              </div>
              <form onSubmit={handlePromoSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Code *</label>
                  <input className="input-field uppercase" placeholder="PROMO20" value={promoForm.code}
                    onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Reduction (%) *', 'Discount (%) *')}</label>
                  <input className="input-field" placeholder="10" type="number" min="1" max="100" value={promoForm.discount}
                    onChange={(e) => setPromoForm((f) => ({ ...f, discount: e.target.value }))} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Limite d\'utilisation (0 = illimite)', 'Usage limit (0 = unlimited)')}</label>
                  <input className="input-field" placeholder="0" type="number" min="0" value={promoForm.usageLimit}
                    onChange={(e) => setPromoForm((f) => ({ ...f, usageLimit: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">{t('Statut', 'Status')}</label>
                  <div className="input-field h-[42px] flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={promoForm.active}
                        onChange={(e) => setPromoForm((f) => ({ ...f, active: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-600 text-gold focus:ring-gold bg-dark-tertiary" />
                      <span className="text-sm">{promoForm.active ? t('Actif', 'Active') : t('Inactif', 'Inactive')}</span>
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary md:col-span-2 disabled:opacity-50">
                  {saving ? t('Sauvegarde...', 'Saving...') : editingPromoId ? t('Mettre a jour', 'Update') : t('Creer le code promo', 'Create promo code')}
                </button>
              </form>
            </section>

            {/* Liste */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('Codes promo', 'Promo codes')} ({promoCodes.length})</h2>
              {promoCodes.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">{t('Aucun code promo.', 'No promo code.')}</p>
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
                            {promo.active ? t('Actif', 'Active') : t('Inactif', 'Inactive')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          -{promo.discount}% &middot; {promo.usageCount}/{promo.usageLimit || '&infin;'} {t('utilisations', 'uses')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleTogglePromoActive(promo.id, promo.active)}
                          className="btn-outline text-sm px-3">
                          {promo.active ? t('Desactiver', 'Disable') : t('Activer', 'Enable')}
                        </button>
                        <button onClick={() => startEditPromo(promo)} className="btn-outline text-sm px-3">{t('Modifier', 'Edit')}</button>
                        <button onClick={() => handleDeletePromo(promo.id)}
                          className="text-sm px-3 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                          {t('Supprimer', 'Delete')}
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
                <option value="all">{t('Tous les tickets', 'All tickets')}</option>
                {TICKET_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{ticketStatusLabel(s)}</option>
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
                    &larr; {t('Retour', 'Back')}
                  </button>
                  <div className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{ticket.subject}</h2>
                        <p className="text-xs text-gray-500">
                          {ticket.email} &middot; #{ticket.id.slice(0, 8)} &middot; {ticket.createdAt.toLocaleDateString(localeTag)}
                        </p>
                      </div>
                      <select className="input-field text-sm w-auto" value={ticket.status}
                        onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value as Ticket['status'])}>
                        {TICKET_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{ticketStatusLabel(s)}</option>
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
                              {msg.sender === 'admin' ? t('Vous (Admin)', 'You (Admin)') : msg.senderEmail || t('Client', 'Customer')} &middot; {msg.createdAt.toLocaleString(localeTag)}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Repondre */}
                    <div className="flex gap-2">
                      <textarea className="input-field flex-1" placeholder={t('Votre reponse...', 'Your reply...')} value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)} rows={2} />
                      <button onClick={() => handleTicketReply(ticket.id)} disabled={sendingReply || !ticketReply.trim()}
                        className="btn-primary px-6 self-end disabled:opacity-50">
                        {sendingReply ? '...' : t('Envoyer', 'Send')}
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
                  <p className="text-gray-500 text-sm py-8 text-center">{t('Aucun ticket.', 'No ticket.')}</p>
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
                              {ticket.messages.length} msg &middot; {ticket.updatedAt.toLocaleDateString(localeTag)}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${TICKET_STATUS_LABELS[ticket.status].color}`}>
                            {ticketStatusLabel(ticket.status)}
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
