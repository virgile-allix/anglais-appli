import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

type FirebaseServices = {
  app: FirebaseApp
  auth: Auth
  db: Firestore
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
    }
  }

  return cached
}
