import {
  collection, doc, addDoc, updateDoc, getDocs, getDoc,
  query, where, onSnapshot, serverTimestamp, limit
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Fare calculation
export const FARE_CONFIG = {
  bike:  { base: 30, perKm: 8,  minFare: 50,  label: 'Bike',  icon: '🏍️' },
  auto:  { base: 40, perKm: 12, minFare: 80,  label: 'Auto',  icon: '🛺' },
  car:   { base: 60, perKm: 18, minFare: 150, label: 'Car',   icon: '🚗' },
}

export const SURGE_MULTIPLIER = 1.0  // Set > 1 during peak hours

export const calculateFare = (distanceKm, vehicleType, isShared = false, passengers = 1) => {
  const config = FARE_CONFIG[vehicleType]
  if (!config) return 0
  let fare = config.base + (distanceKm * config.perKm)
  fare = Math.max(fare, config.minFare)
  fare *= SURGE_MULTIPLIER
  if (isShared && passengers > 1) fare = fare / passengers * 1.3 // 30% premium for shared
  return Math.round(fare)
}

export const createRide = async (rideData) => {
  const ref = await addDoc(collection(db, 'rides'), {
    ...rideData,
    vehicleType: rideData.vehicle || rideData.vehicleType || 'auto', // canonical field
    status: 'searching',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const cancelRide = async (rideId, cancelledBy = 'user') => {
  await updateDoc(doc(db, 'rides', rideId), {
    status: 'cancelled', cancelledBy,
    cancelledAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
}

export const updateRideStatus = async (rideId, status, extra = {}) => {
  await updateDoc(doc(db, 'rides', rideId), {
    status, ...extra, updatedAt: serverTimestamp()
  })
}

export const getRideById = async (rideId) => {
  const snap = await getDoc(doc(db, 'rides', rideId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getUserRides = async (userId) => {
  const q = query(
    collection(db, 'rides'),
    where('userId', '==', userId),
    limit(20)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getDriverRides = async (driverId) => {
  const q = query(
    collection(db, 'rides'),
    where('driverId', '==', driverId),
    limit(20)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getPendingRides = async () => {
  const q = query(
    collection(db, 'rides'),
    where('status', '==', 'searching')
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribeToRide = (rideId, callback) => {
  return onSnapshot(doc(db, 'rides', rideId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

// Shared rides
export const createSharedRide = async (data) => {
  const ref = await addDoc(collection(db, 'sharedRides'), {
    ...data,
    passengers: [],
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const getOpenSharedRides = async (vehicleType) => {
  const q = query(
    collection(db, 'sharedRides'),
    where('status', '==', 'open'),
    where('vehicleType', '==', vehicleType),
    limit(10)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const joinSharedRide = async (sharedRideId, passengerData) => {
  const ref = doc(db, 'sharedRides', sharedRideId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Ride not found')
  const ride = snap.data()
  if (ride.passengers.length >= ride.maxPassengers)
    throw new Error('Ride is full')
  const passengers = [...ride.passengers, passengerData]
  const status = passengers.length >= ride.maxPassengers ? 'full' : 'open'
  await updateDoc(ref, { passengers, status, updatedAt: serverTimestamp() })
}

export const subscribeToSharedRides = (vehicleType, callback) => {
  const q = query(
    collection(db, 'sharedRides'),
    where('status', '==', 'open'),
    where('vehicleType', '==', vehicleType)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export const getPlatformStats = async () => {
  try {
    const [ridesSnap, driversSnap, usersSnap, feedbackSnap] = await Promise.all([
      getDocs(query(collection(db, 'rides'), limit(1000))),
      getDocs(collection(db, 'drivers')),
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'feedback'), limit(500))),
    ])
    const drivers  = driversSnap.docs.map(d => d.data())
    const approved = drivers.filter(d => d.status === 'approved')
    const ratings  = feedbackSnap.docs.map(d => d.data().rating).filter(r => r > 0)
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null
    const cities = new Set(drivers.map(d => d.city).filter(Boolean))
    return {
      totalRides:     ridesSnap.size,
      completedRides: ridesSnap.docs.filter(d => d.data().status === 'completed').length,
      activeDrivers:  approved.length,
      totalUsers:     usersSnap.size,
      citiesServed:   cities.size || null,
      avgRating,
    }
  } catch { return { totalRides: 0, completedRides: 0, activeDrivers: 0, totalUsers: 0, citiesServed: null, avgRating: null } }
}
