import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Configuración de Firebase - estas variables vienen del .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase solo si no está ya inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Auth
export const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Storage para imágenes
export const storage = getStorage(app)

// Funciones de autenticación
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const logout = () => firebaseSignOut(auth)

// Obtener token JWT del usuario actual
export const getIdToken = async () => {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}