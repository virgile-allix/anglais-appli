import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBSUELIqc3wBs-n0fgD9DHMH-sr_m4aapM",
  authDomain: "anglais-c44b7.firebaseapp.com",
  projectId: "anglais-c44b7",
  storageBucket: "anglais-c44b7.firebasestorage.app",
  messagingSenderId: "1065955267800",
  appId: "1:1065955267800:web:f92add1d79a53283c1f3ad",
  measurementId: "G-MDX1Z43Z9D",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
