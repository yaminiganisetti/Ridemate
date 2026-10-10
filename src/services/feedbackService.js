import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'

export const submitFeedback = async (rideId, userId, driverId, rating, comment) => {
  await addDoc(collection(db, 'feedback'), {
    rideId, userId, driverId, rating, comment,
    createdAt: serverTimestamp(),
  })
  // Update driver average rating
  const driverRef = doc(db, 'drivers', driverId)
  // Simple increment approach (for atomic operations you'd use Cloud Functions)
  await updateDoc(driverRef, {
    ratingTotal: increment(rating),
    ratingCount: increment(1),
  })
}

export const getFeedbackForDriver = async (driverId) => {
  const q = query(
    collection(db, 'feedback'),
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllFeedback = async () => {
  const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}
