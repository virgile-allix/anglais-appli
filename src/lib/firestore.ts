import { getFirebase } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
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

/* ─── Produits fallback (si Firestore est vide) ─── */

const FALLBACK_PRODUCTS: Product[] = [
  { id: 'f1', name: 'Produit Alpha', price: 49.99, description: 'Description du produit Alpha.', image: '', category: 'general' },
  { id: 'f2', name: 'Produit Beta', price: 79.99, description: 'Description du produit Beta.', image: '', category: 'general' },
  { id: 'f3', name: 'Produit Gamma', price: 129.99, description: 'Description du produit Gamma.', image: '', category: 'general' },
  { id: 'f4', name: 'Produit Delta', price: 199.99, description: 'Description du produit Delta.', image: '', category: 'premium' },
  { id: 'f5', name: 'Produit Epsilon', price: 59.99, description: 'Description du produit Epsilon.', image: '', category: 'general' },
  { id: 'f6', name: 'Produit Zeta', price: 89.99, description: 'Description du produit Zeta.', image: '', category: 'premium' },
]

/* ─── Produits ─── */

export async function getProducts(): Promise<Product[]> {
  try {
    const { db } = getFirebase()
    const snap = await getDocs(collection(db, 'products'))
    if (snap.empty) return FALLBACK_PRODUCTS
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)
  } catch {
    return FALLBACK_PRODUCTS
  }
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

export async function saveUserProfile(uid: string, email: string): Promise<UserProfile> {
  const { db } = getFirebase()
  await setDoc(doc(db, 'users', uid), {
    email,
    isAdmin: false,
    createdAt: Timestamp.now(),
  })
  return { uid, email, isAdmin: false, createdAt: new Date() }
}

/* ─── Seed : peupler Firestore avec des produits de démo ─── */

export async function seedProducts(): Promise<void> {
  const { db } = getFirebase()
  const products = [
    { name: 'Produit Alpha', price: 49.99, description: 'Description du produit Alpha.', image: '', category: 'general' },
    { name: 'Produit Beta', price: 79.99, description: 'Description du produit Beta.', image: '', category: 'general' },
    { name: 'Produit Gamma', price: 129.99, description: 'Description du produit Gamma.', image: '', category: 'general' },
    { name: 'Produit Delta', price: 199.99, description: 'Description du produit Delta.', image: '', category: 'premium' },
    { name: 'Produit Epsilon', price: 59.99, description: 'Description du produit Epsilon.', image: '', category: 'general' },
    { name: 'Produit Zeta', price: 89.99, description: 'Description du produit Zeta.', image: '', category: 'premium' },
  ]

  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Timestamp.now(),
    })
  }
}
