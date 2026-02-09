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
import { getFirebase } from '@/lib/firebase'

export type UserProfile = {
  uid: string
  email: string
  displayName?: string
  isAdmin: boolean
  createdAt: Date
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
})

async function loadProfile(uid: string): Promise<UserProfile | null> {
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

async function saveProfile(user: User, displayName?: string): Promise<UserProfile> {
  const { db } = getFirebase()
  const profile: any = {
    email: user.email || '',
    isAdmin: false,
    createdAt: Timestamp.now(),
  }
  if (displayName) {
    profile.displayName = displayName
    profile.displayName_lower = displayName.toLowerCase().trim()
  }
  await setDoc(doc(db, 'users', user.uid), profile)
  return {
    uid: user.uid,
    email: profile.email,
    displayName,
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
    let unsubscribe = () => {}
    try {
      const { auth } = getFirebase()
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser)
        if (firebaseUser) {
          const p = await loadProfile(firebaseUser.uid)
          setProfile(p)
        } else {
          setProfile(null)
        }
        setLoading(false)
      })
    } catch {
      setLoading(false)
    }
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { auth } = getFirebase()
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

  const register = async (email: string, password: string, displayName?: string) => {
    const { auth } = getFirebase()
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password)
    // Sauvegarder le profil en base
    const newProfile = await saveProfile(u, displayName)
    setProfile(newProfile)
  }

  const logout = async () => {
    const { auth } = getFirebase()
    await signOut(auth)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (!user) return
    const p = await loadProfile(user.uid)
    setProfile(p)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
