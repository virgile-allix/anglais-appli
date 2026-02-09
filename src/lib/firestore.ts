import { getFirebase } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import type { LocalizedText } from './i18n'

/* ─── Types ─── */

export type Product = {
  id: string
  name: string
  nameI18n?: LocalizedText
  price: number
  description: string
  descriptionI18n?: LocalizedText
  image: string
  category: string
  categoryI18n?: LocalizedText
  stock: number
  model3d?: string // URL du fichier GLB/GLTF
}

export type OrderItem = {
  id: string
  name: string
  nameI18n?: LocalizedText
  price: number
  quantity: number
  // Figurine personnalisee
  figurineId?: string
  modelUrl?: string
}

export type Order = {
  id: string
  uid: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered'
  paymentId: string
  paymentMethod: 'stripe' | 'paypal'
  shippingAddress?: Address
  createdAt: Date
}

export type UserProfile = {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
  createdAt: Date
}

/* ─── Produits ─── */

export async function getProducts(): Promise<Product[]> {
  const { db } = getFirebase()
  const snap = await getDocs(collection(db, 'products'))
  return snap.docs.map((d) => {
    const data = d.data()
    const nameI18n = (data.name_i18n || {}) as LocalizedText
    const descriptionI18n = (data.description_i18n || {}) as LocalizedText
    const categoryI18n = (data.category_i18n || {}) as LocalizedText
    return {
      id: d.id,
      name: data.name || nameI18n.fr || '',
      nameI18n,
      price: data.price || 0,
      description: data.description || descriptionI18n.fr || '',
      descriptionI18n,
      image: data.image || '',
      category: data.category || categoryI18n.fr || 'general',
      categoryI18n,
      stock: data.stock ?? 0,
      model3d: data.model3d || '',
    }
  })
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { db } = getFirebase()
    const snap = await getDoc(doc(db, 'products', id))
    if (!snap.exists()) return null
    const data = snap.data()
    const nameI18n = (data.name_i18n || {}) as LocalizedText
    const descriptionI18n = (data.description_i18n || {}) as LocalizedText
    const categoryI18n = (data.category_i18n || {}) as LocalizedText
    return {
      id: snap.id,
      name: data.name || nameI18n.fr || '',
      nameI18n,
      price: data.price || 0,
      description: data.description || descriptionI18n.fr || '',
      descriptionI18n,
      image: data.image || '',
      category: data.category || categoryI18n.fr || 'general',
      categoryI18n,
      stock: data.stock ?? 0,
      model3d: data.model3d || '',
    }
  } catch {
    return null
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<string> {
  const { db } = getFirebase()
  const { nameI18n, descriptionI18n, categoryI18n, ...rest } = product
  const docRef = await addDoc(collection(db, 'products'), {
    ...rest,
    name_i18n: nameI18n || {},
    description_i18n: descriptionI18n || {},
    category_i18n: categoryI18n || {},
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { db } = getFirebase()
  const { nameI18n, descriptionI18n, categoryI18n, ...rest } = data
  const payload: Record<string, unknown> = { ...rest }
  if (nameI18n) payload.name_i18n = nameI18n
  if (descriptionI18n) payload.description_i18n = descriptionI18n
  if (categoryI18n) payload.category_i18n = categoryI18n
  await updateDoc(doc(db, 'products', id), payload)
}

export async function deleteProduct(id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'products', id))
}

/* ─── Commandes ─── */

export async function getUserOrders(uid: string): Promise<Order[]> {
  try {
    const { db } = getFirebase()
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', uid)
    )
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as Order
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (err) {
    console.error('getUserOrders error:', err)
    return []
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const { db } = getFirebase()
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      } as Order
    })
  } catch {
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'orders', orderId), { status })
}

export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt'>
): Promise<string> {
  const { db } = getFirebase()
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

/* ─── Utilisateurs ─── */

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { db } = getFirebase()
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      uid,
      email: data.email || '',
      displayName: data.displayName || data.display_name,
      isAdmin: data.isAdmin || false,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    }
  } catch {
    return null
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { db } = getFirebase()
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        uid: d.id,
        email: data.email || '',
        isAdmin: data.isAdmin || false,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      }
    })
  } catch {
    return []
  }
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const { db } = getFirebase()
    const normalized = username.toLowerCase().trim()
    const q = query(
      collection(db, 'users'),
      where('displayName_lower', '==', normalized)
    )
    const snap = await getDocs(q)
    return snap.empty
  } catch {
    return false
  }
}

export async function saveUserProfile(uid: string, email: string, displayName?: string): Promise<UserProfile> {
  const { db } = getFirebase()
  const data: any = {
    email,
    isAdmin: false,
    createdAt: Timestamp.now(),
  }
  if (displayName) {
    data.displayName = displayName
    data.displayName_lower = displayName.toLowerCase().trim()
  }
  await setDoc(doc(db, 'users', uid), data)
  return { uid, email, displayName, isAdmin: false, createdAt: new Date() }
}

export async function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'users', uid), {
    displayName,
    displayName_lower: displayName.toLowerCase().trim(),
  })
}

export async function setUserAdmin(uid: string, isAdmin: boolean): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'users', uid), { isAdmin })
}

/* ─── Adresses utilisateur ─── */

export type Address = {
  label: string
  firstName: string
  lastName: string
  street: string
  city: string
  zip: string
  country: string
  phone: string
}

export async function getUserAddresses(uid: string): Promise<Address[]> {
  try {
    const { db } = getFirebase()
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return []
    const data = snap.data()
    return Array.isArray(data.addresses) ? data.addresses : []
  } catch {
    return []
  }
}

export async function saveUserAddresses(uid: string, addresses: Address[]): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'users', uid), { addresses })
}

/* ─── Stock ─── */

export async function decrementStock(productId: string, quantity: number): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, 'products', productId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const current = snap.data().stock ?? 0
    await updateDoc(ref, { stock: Math.max(0, current - quantity) })
  }
}

/* ─── Codes promo ─── */

export type PromoCode = {
  id: string
  code: string
  discount: number // pourcentage (ex: 10 = 10%)
  active: boolean
  usageLimit: number // 0 = illimité
  usageCount: number
  createdAt: Date
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const { db } = getFirebase()
  const snap = await getDocs(collection(db, 'promoCodes'))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      code: data.code || '',
      discount: data.discount || 0,
      active: data.active ?? true,
      usageLimit: data.usageLimit ?? 0,
      usageCount: data.usageCount ?? 0,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    }
  })
}

export async function createPromoCode(promo: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>): Promise<string> {
  const { db } = getFirebase()
  const docRef = await addDoc(collection(db, 'promoCodes'), {
    ...promo,
    usageCount: 0,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updatePromoCode(id: string, data: Partial<PromoCode>): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'promoCodes', id), data)
}

export async function deletePromoCode(id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'promoCodes', id))
}

export async function validatePromoCode(code: string): Promise<PromoCode | null> {
  const { db } = getFirebase()
  const q = query(collection(db, 'promoCodes'), where('code', '==', code.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  const data = d.data()
  const promo: PromoCode = {
    id: d.id,
    code: data.code,
    discount: data.discount || 0,
    active: data.active ?? true,
    usageLimit: data.usageLimit ?? 0,
    usageCount: data.usageCount ?? 0,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  }
  if (!promo.active) return null
  if (promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit) return null
  return promo
}

export async function incrementPromoUsage(id: string): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, 'promoCodes', id)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const current = snap.data().usageCount ?? 0
    await updateDoc(ref, { usageCount: current + 1 })
  }
}

/* ─── Tickets support ─── */

export type TicketMessage = {
  sender: 'client' | 'admin'
  senderEmail: string
  text: string
  createdAt: Date
}

export type Ticket = {
  id: string
  uid: string
  email: string
  subject: string
  status: 'open' | 'in_progress' | 'closed'
  messages: TicketMessage[]
  createdAt: Date
  updatedAt: Date
}

export async function createTicket(
  ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const { db } = getFirebase()
  const now = Timestamp.now()
  const messages = ticket.messages.map((m) => ({
    ...m,
    createdAt: now,
  }))
  const docRef = await addDoc(collection(db, 'tickets'), {
    uid: ticket.uid,
    email: ticket.email,
    subject: ticket.subject,
    status: ticket.status,
    messages,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

function parseTicketDoc(d: { id: string; data: () => Record<string, unknown> }): Ticket {
  const raw = d.data() as Record<string, unknown>
  const msgs = (Array.isArray(raw.messages) ? raw.messages : []) as Array<Record<string, unknown>>
  return {
    id: d.id,
    uid: (raw.uid as string) || '',
    email: (raw.email as string) || '',
    subject: (raw.subject as string) || '',
    status: (raw.status as Ticket['status']) || 'open',
    messages: msgs.map((m) => ({
      sender: (m.sender as TicketMessage['sender']) || 'client',
      senderEmail: (m.senderEmail as string) || '',
      text: (m.text as string) || '',
      createdAt: (m.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    })),
    createdAt: (raw.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    updatedAt: (raw.updatedAt as { toDate?: () => Date })?.toDate?.() || new Date(),
  }
}

export async function getUserTickets(uid: string): Promise<Ticket[]> {
  try {
    const { db } = getFirebase()
    const q = query(
      collection(db, 'tickets'),
      where('uid', '==', uid),
      orderBy('updatedAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(parseTicketDoc)
  } catch {
    return []
  }
}

export async function getAllTickets(): Promise<Ticket[]> {
  try {
    const { db } = getFirebase()
    const q = query(collection(db, 'tickets'), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(parseTicketDoc)
  } catch {
    return []
  }
}

export async function addTicketMessage(
  ticketId: string,
  message: Omit<TicketMessage, 'createdAt'>
): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, 'tickets', ticketId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data()
  const messages = Array.isArray(data.messages) ? data.messages : []
  messages.push({ ...message, createdAt: Timestamp.now() })
  await updateDoc(ref, { messages, updatedAt: Timestamp.now() })
}

export async function updateTicketStatus(
  ticketId: string,
  status: Ticket['status']
): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'tickets', ticketId), { status, updatedAt: Timestamp.now() })
}

/* ─── Figurines personnalisees (Meshy) ─── */

export type CustomFigurine = {
  id: string
  uid: string
  name: string
  description: string // prompt envoyé à Meshy
  style: string // ex: "realistic", "cartoon", "anime"
  status: 'pending' | 'generating' | 'texturing' | 'ready' | 'failed'
  meshyTaskId?: string // ID de la tâche Meshy (preview)
  refineTaskId?: string // ID de la tâche Meshy (refine/texturation)
  modelUrl?: string // URL du GLB généré
  thumbnailUrl?: string
  colors?: string[] // couleurs sélectionnées par le client
  customColorText?: string // précision couleur libre
  texturePrompt?: string // prompt de texturation envoyé à Meshy refine
  generationMode?: 'text' | 'image' // mode de génération
  referenceImageUrl?: string // URL de l'image de référence (mode image)
  createdAt: Date
  updatedAt: Date
}

export async function createCustomFigurine(
  figurine: Omit<CustomFigurine, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const { db } = getFirebase()
  const now = Timestamp.now()
  const docRef = await addDoc(collection(db, 'customFigurines'), {
    ...figurine,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function getUserFigurines(uid: string): Promise<CustomFigurine[]> {
  try {
    const { db } = getFirebase()
    const q = query(
      collection(db, 'customFigurines'),
      where('uid', '==', uid)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        uid: data.uid || '',
        name: data.name || '',
        description: data.description || '',
        style: data.style || 'realistic',
        status: data.status || 'pending',
        meshyTaskId: data.meshyTaskId || '',
        refineTaskId: data.refineTaskId || '',
        modelUrl: data.modelUrl || '',
        thumbnailUrl: data.thumbnailUrl || '',
        colors: data.colors || [],
        customColorText: data.customColorText || '',
        texturePrompt: data.texturePrompt || '',
        generationMode: data.generationMode || 'text',
        referenceImageUrl: data.referenceImageUrl || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      }
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (err) {
    console.error('Error fetching figurines:', err)
    return []
  }
}

export async function getFigurineById(id: string): Promise<CustomFigurine | null> {
  try {
    const { db } = getFirebase()
    const snap = await getDoc(doc(db, 'customFigurines', id))
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      id: snap.id,
      uid: data.uid || '',
      name: data.name || '',
      description: data.description || '',
      style: data.style || 'realistic',
      status: data.status || 'pending',
      meshyTaskId: data.meshyTaskId || '',
      refineTaskId: data.refineTaskId || '',
      modelUrl: data.modelUrl || '',
      thumbnailUrl: data.thumbnailUrl || '',
      colors: data.colors || [],
      customColorText: data.customColorText || '',
      texturePrompt: data.texturePrompt || '',
      generationMode: data.generationMode || 'text',
      referenceImageUrl: data.referenceImageUrl || '',
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    }
  } catch {
    return null
  }
}

export async function updateFigurine(
  id: string,
  data: Partial<Omit<CustomFigurine, 'id' | 'uid' | 'createdAt'>>
): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'customFigurines', id), {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteFigurine(id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'customFigurines', id))
}

/* ─── Avis produits ─── */

export type Review = {
  id: string
  productId: string
  uid: string
  userEmail: string
  displayName?: string
  rating: number // 1-5
  comment: string
  createdAt: Date
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const { db } = getFirebase()
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        productId: data.productId || '',
        uid: data.uid || '',
        userEmail: data.userEmail || '',
        displayName: data.displayName,
        rating: data.rating || 5,
        comment: data.comment || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
      }
    })
  } catch {
    return []
  }
}

export async function createReview(
  review: Omit<Review, 'id' | 'createdAt'>
): Promise<string> {
  const { db } = getFirebase()
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getUserReviewForProduct(
  uid: string,
  productId: string
): Promise<Review | null> {
  try {
    const { db } = getFirebase()
    const q = query(
      collection(db, 'reviews'),
      where('uid', '==', uid),
      where('productId', '==', productId)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    const data = d.data()
    return {
      id: d.id,
      productId: data.productId || '',
      uid: data.uid || '',
      userEmail: data.userEmail || '',
      displayName: data.displayName,
      rating: data.rating || 5,
      comment: data.comment || '',
      createdAt: data.createdAt?.toDate?.() || new Date(),
    }
  } catch {
    return null
  }
}

export async function deleteReview(id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, 'reviews', id))
}

export async function getProductAverageRating(productId: string): Promise<{ average: number; count: number }> {
  try {
    const reviews = await getProductReviews(productId)
    if (reviews.length === 0) return { average: 0, count: 0 }
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return { average: total / reviews.length, count: reviews.length }
  } catch {
    return { average: 0, count: 0 }
  }
}

/* ─── Seed : peupler Firestore avec des produits de démo ─── */

export async function seedProducts(): Promise<void> {
  const { db } = getFirebase()
  const products = [
    {
      name: 'Produit Alpha',
      price: 49.99,
      description: 'Description du produit Alpha.',
      image: '',
      category: 'general',
      stock: 10,
      name_i18n: { fr: 'Produit Alpha', en: 'Product Alpha' },
      description_i18n: { fr: 'Description du produit Alpha.', en: 'Product Alpha description.' },
      category_i18n: { fr: 'General', en: 'General' },
    },
    {
      name: 'Produit Beta',
      price: 79.99,
      description: 'Description du produit Beta.',
      image: '',
      category: 'general',
      stock: 15,
      name_i18n: { fr: 'Produit Beta', en: 'Product Beta' },
      description_i18n: { fr: 'Description du produit Beta.', en: 'Product Beta description.' },
      category_i18n: { fr: 'General', en: 'General' },
    },
    {
      name: 'Produit Gamma',
      price: 129.99,
      description: 'Description du produit Gamma.',
      image: '',
      category: 'general',
      stock: 5,
      name_i18n: { fr: 'Produit Gamma', en: 'Product Gamma' },
      description_i18n: { fr: 'Description du produit Gamma.', en: 'Product Gamma description.' },
      category_i18n: { fr: 'General', en: 'General' },
    },
    {
      name: 'Produit Delta',
      price: 199.99,
      description: 'Description du produit Delta.',
      image: '',
      category: 'premium',
      stock: 3,
      name_i18n: { fr: 'Produit Delta', en: 'Product Delta' },
      description_i18n: { fr: 'Description du produit Delta.', en: 'Product Delta description.' },
      category_i18n: { fr: 'Premium', en: 'Premium' },
    },
    {
      name: 'Produit Epsilon',
      price: 59.99,
      description: 'Description du produit Epsilon.',
      image: '',
      category: 'general',
      stock: 20,
      name_i18n: { fr: 'Produit Epsilon', en: 'Product Epsilon' },
      description_i18n: { fr: 'Description du produit Epsilon.', en: 'Product Epsilon description.' },
      category_i18n: { fr: 'General', en: 'General' },
    },
    {
      name: 'Produit Zeta',
      price: 89.99,
      description: 'Description du produit Zeta.',
      image: '',
      category: 'premium',
      stock: 8,
      name_i18n: { fr: 'Produit Zeta', en: 'Product Zeta' },
      description_i18n: { fr: 'Description du produit Zeta.', en: 'Product Zeta description.' },
      category_i18n: { fr: 'Premium', en: 'Premium' },
    },
  ]

  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Timestamp.now(),
    })
  }
}
