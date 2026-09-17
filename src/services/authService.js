import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const googleProvider = new GoogleAuthProvider()

export const signUp = async ({ name, email, password, role = 'user', phone = '' }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name,
    email,
    phone,
    role,
    avatar: '',
    savedLocations: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return cred.user
}

export const signIn = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export const signInWithGoogle = async (role = 'user') => {
  const cred = await signInWithPopup(auth, googleProvider)
  const userRef = doc(db, 'users', cred.user.uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      name: cred.user.displayName,
      email: cred.user.email,
      phone: cred.user.phoneNumber || '',
      role,
      avatar: cred.user.photoURL || '',
      savedLocations: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  return cred.user
}

export const logOut = () => signOut(auth)

export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export const updateUserProfile = async (uid, data) => {
  const { doc, updateDoc } = await import('firebase/firestore')
  const { db } = await import('../firebase/config')
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: new Date() })
}
