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

/* ─── Types ─── */

export type Product = {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
}

export type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  uid: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered'
  paymentId: string
  paymentMethod: 'stripe' | 'paypal'
  createdAt: Date
}

export type UserProfile = {
  uid: string
  email: string
  isAdmin: boolean
  createdAt: Date
}

/* ─── Produits ─── */

export async function getProducts(): Promise<Product[]> {
  const { db } = getFirebase()
  const snap = await getDocs(collection(db, 'products'))
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name || '',
      price: data.price || 0,
      description: data.description || '',
      image: data.image || '',
      category: data.category || 'general',
      stock: data.stock ?? 0,
    }
  })
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<string> {
  const { db } = getFirebase()
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'products', id), data)
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
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
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

export async function saveUserProfile(uid: string, email: string): Promise<UserProfile> {
  const { db } = getFirebase()
  await setDoc(doc(db, 'users', uid), {
    email,
    isAdmin: false,
    createdAt: Timestamp.now(),
  })
  return { uid, email, isAdmin: false, createdAt: new Date() }
}

export async function setUserAdmin(uid: string, isAdmin: boolean): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, 'users', uid), { isAdmin })
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

/* ─── Seed : peupler Firestore avec des produits de démo ─── */

export async function seedProducts(): Promise<void> {
  const { db } = getFirebase()
  const products = [
    { name: 'Produit Alpha', price: 49.99, description: 'Description du produit Alpha.', image: '', category: 'general', stock: 10 },
    { name: 'Produit Beta', price: 79.99, description: 'Description du produit Beta.', image: '', category: 'general', stock: 15 },
    { name: 'Produit Gamma', price: 129.99, description: 'Description du produit Gamma.', image: '', category: 'general', stock: 5 },
    { name: 'Produit Delta', price: 199.99, description: 'Description du produit Delta.', image: '', category: 'premium', stock: 3 },
    { name: 'Produit Epsilon', price: 59.99, description: 'Description du produit Epsilon.', image: '', category: 'general', stock: 20 },
    { name: 'Produit Zeta', price: 89.99, description: 'Description du produit Zeta.', image: '', category: 'premium', stock: 8 },
  ]

  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Timestamp.now(),
    })
  }
}
