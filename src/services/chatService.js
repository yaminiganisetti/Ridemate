import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export const sendMessage = async (rideId, senderId, receiverId, text) => {
  await addDoc(collection(db, 'messages'), {
    rideId, senderId, receiverId, text,
    read: false, createdAt: serverTimestamp()
  })
}

export const subscribeToChat = (rideId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('rideId', '==', rideId),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
