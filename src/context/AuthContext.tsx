'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export type UserProfile = {
  uid: string
  email: string
  isAdmin: boolean
  createdAt: Date
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

async function loadProfile(uid: string): Promise<UserProfile | null> {
  try {
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

async function saveProfile(user: User): Promise<UserProfile> {
  const profile: Omit<UserProfile, 'uid' | 'createdAt'> & { createdAt: ReturnType<typeof Timestamp.now> } = {
    email: user.email || '',
    isAdmin: false,
    createdAt: Timestamp.now(),
  }
  await setDoc(doc(db, 'users', user.uid), profile)
  return {
    uid: user.uid,
    email: profile.email,
    isAdmin: false,
    createdAt: new Date(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger le profil Firestore à chaque changement d'auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await loadProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    const { user: u } = await signInWithEmailAndPassword(auth, email, password)
    const p = await loadProfile(u.uid)
    // Si le profil n'existe pas encore (ancien compte), le créer
    if (!p) {
      const newProfile = await saveProfile(u)
      setProfile(newProfile)
    } else {
      setProfile(p)
    }
  }

  const register = async (email: string, password: string) => {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password)
    // Sauvegarder le profil en base
    const newProfile = await saveProfile(u)
    setProfile(newProfile)
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
