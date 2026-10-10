import { collection, addDoc, updateDoc, doc, query, where, onSnapshot, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export const createNotification = async (userId, type, title, body, extra = {}) => {
  await addDoc(collection(db, 'notifications'), {
    userId, type, title, body, read: false,
    ...extra, createdAt: serverTimestamp()
  })
}

export const markNotificationRead = async (notifId) => {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const markAllRead = async (userId) => {
  const { collection, query, where, getDocs, writeBatch, doc } = await import('firebase/firestore')
  const { db } = await import('../firebase/config')
  const snap = await getDocs(query(collection(db, 'notifications'), where('userId','==',userId), where('read','==',false)))
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(doc(db, 'notifications', d.id), { read: true }))
  await batch.commit()
}
