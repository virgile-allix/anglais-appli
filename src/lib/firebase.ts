import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBSUELIqc3wBs-n0fgD9DHMH-sr_m4aapM',
  authDomain: 'anglais-c44b7.firebaseapp.com',
  projectId: 'anglais-c44b7',
  storageBucket: 'anglais-c44b7.firebasestorage.app',
  messagingSenderId: '1065955267800',
  appId: '1:1065955267800:web:f92add1d79a53283c1f3ad',
  measurementId: 'G-MDX1Z43Z9D',
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
}

type FirebaseServices = {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
}

let cached: FirebaseServices | null = null

function hasConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  )
}

export function getFirebase(): FirebaseServices {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client used during server render.')
  }

  if (!hasConfig()) {
    throw new Error('Firebase config manquante.')
  }

  if (!cached) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    cached = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    }
  }

  return cached
}
