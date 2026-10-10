import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// UPI Deep Links
export const UPI_APPS = {
  phonepe: {
    name: 'PhonePe',
    icon: '/icons/phonepe.svg',
    color: '#5f259f',
    scheme: (upiId, amount, note) => `phonepe://pay?pa=${upiId}&pn=RideMate&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
  },
  gpay: {
    name: 'Google Pay',
    icon: '/icons/gpay.svg',
    color: '#4285f4',
    scheme: (upiId, amount, note) => `tez://upi/pay?pa=${upiId}&pn=RideMate&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
  },
  paytm: {
    name: 'Paytm',
    icon: '/icons/paytm.svg',
    color: '#002970',
    scheme: (upiId, amount, note) => `paytmmp://pay?pa=${upiId}&pn=RideMate&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
  },
}

export const createTransaction = async (txData) => {
  const ref = await addDoc(collection(db, 'transactions'), {
    ...txData,
    status: 'pending',   // pending | success | failed
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const updateTransactionStatus = async (txId, status, extra = {}) => {
  await updateDoc(doc(db, 'transactions', txId), {
    status, ...extra, updatedAt: serverTimestamp()
  })
}

export const openUPIApp = (app, upiId, amount, note) => {
  const appConfig = UPI_APPS[app]
  if (!appConfig) return
  const url = appConfig.scheme(upiId, amount, note)
  window.location.href = url
}

// Razorpay integration scaffold
export const initRazorpay = (options) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(new window.Razorpay(options))
      script.onerror = () => reject(new Error('Razorpay failed to load'))
      document.body.appendChild(script)
    } else {
      resolve(new window.Razorpay(options))
    }
  })
}
