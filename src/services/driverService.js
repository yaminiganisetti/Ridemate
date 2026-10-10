import {
  collection, doc, addDoc, updateDoc, getDocs,
  getDoc, query, where, orderBy, onSnapshot, serverTimestamp, setDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'

export const registerDriver = async (uid, driverData, licenseFile) => {
  let licenseUrl = ''
  if (licenseFile) {
    const storageRef = ref(storage, `licenses/${uid}/${licenseFile.name}`)
    const snap = await uploadBytes(storageRef, licenseFile)
    licenseUrl = await getDownloadURL(snap.ref)
  }
  await setDoc(doc(db, 'drivers', uid), {
    uid,
    ...driverData,
    licenseUrl,
    status: 'pending',   // pending | approved | rejected
    isOnline: false,
    rating: 0,
    ratingCount: 0,
    totalRides: 0,
    totalEarnings: 0,
    currentLocation: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // Update user role to driver
  await updateDoc(doc(db, 'users', uid), { role: 'driver' })
}

export const updateDriverStatus = async (driverId, status) => {
  await updateDoc(doc(db, 'drivers', driverId), {
    status, updatedAt: serverTimestamp()
  })
  // Send notification
  await addDoc(collection(db, 'notifications'), {
    userId: driverId,
    type: status === 'approved' ? 'driver_approved' : 'driver_rejected',
    title: status === 'approved' ? '🎉 Application Approved!' : 'Application Rejected',
    body: status === 'approved'
      ? 'Congratulations! You can now start accepting rides.'
      : 'Your driver application was not approved. Please contact support.',
    read: false,
    createdAt: serverTimestamp(),
  })
}

export const toggleDriverOnline = async (driverId, isOnline) => {
  await updateDoc(doc(db, 'drivers', driverId), {
    isOnline, updatedAt: serverTimestamp()
  })
}

export const updateDriverLocation = async (driverId, lat, lng) => {
  await updateDoc(doc(db, 'drivers', driverId), {
    currentLocation: { lat, lng },
    updatedAt: serverTimestamp(),
  })
}

export const getDriverProfile = async (driverId) => {
  const snap = await getDoc(doc(db, 'drivers', driverId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getPendingDrivers = async () => {
  const q = query(
    collection(db, 'drivers'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllDrivers = async () => {
  const snaps = await getDocs(collection(db, 'drivers'))
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeToDriverLocation = (driverId, callback) => {
  return onSnapshot(doc(db, 'drivers', driverId), (snap) => {
    if (snap.exists()) callback(snap.data().currentLocation)
  })
}
