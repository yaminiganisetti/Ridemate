import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Search, Loader, Check, ArrowLeft, X, AlertCircle, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { FARE_CONFIG, calculateFare, createRide, subscribeToRide, updateRideStatus, cancelRide, subscribeToSharedRides } from '../../services/rideService'
import { getSurgeMultiplier } from '../../utils/pricing'
import { calculateDistance, getCurrentLocation, reverseGeocode, estimateDuration, formatDistance, formatDuration } from '../../utils/mapUtils'
import { searchLocations } from '../../utils/locationSearch'
import { STATUS_LABELS } from '../../utils/helpers'
import PaymentModal from '../../components/booking/PaymentModal'
import RideTrackerModal from '../../components/booking/RideTrackerModal'
import FeedbackModal from '../../components/booking/FeedbackModal'
import SharedRideList from '../../components/shared/SharedRideList'
import ChatModal from '../../components/chat/ChatModal'

const VEHICLE_ACCENT = {
  bike: { sel: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600', fare: 'text-amber-700' },
  auto: { sel: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-700 dark:text-primary-400', btn: 'bg-primary-600 hover:bg-primary-700', fare: 'text-primary-700' },
  car:  { sel: 'border-green-500 bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', btn: 'bg-green-600 hover:bg-green-600-text', fare: 'text-green-700' },
}

export default function BookingPage() {
  const routerLoc = useLocation()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { toast } = useToast()

  const urlV = searchParams.get('vehicle')
  const initV = ['bike','auto','car'].includes(urlV) ? urlV : 'auto'

  const [pickup, setPickup]           = useState(routerLoc.state?.pickup || '')
  const [destination, setDestination] = useState(routerLoc.state?.destination || '')
  const [pickupCoords, setPickupCoords]   = useState(null)
  const [destCoords, setDestCoords]       = useState(null)
  const [pickupMeta, setPickupMeta]       = useState(null)
  const [destMeta, setDestMeta]           = useState(null)
  const [vehicle, setVehicle]         = useState(initV)
  const [isShared, setIsShared]       = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching]     = useState(false)
  const [step, setStep]         = useState('input')
  const [distance, setDistance] = useState(null)
  const [fare, setFare]         = useState(null)
  const [duration, setDuration] = useState(null)
  const [surge, setSurge]       = useState(1.0)
  const [rideId, setRideId]     = useState(null)
  const [rideData, setRideData] = useState(null)
  const [driver, setDriver]     = useState(null)
  const [sharedRides, setSharedRides] = useState([])
  const [loading, setLoading]         = useState(false)
  const [locating, setLocating]       = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showPayment, setShowPayment]   = useState(false)
  const [showTracker, setShowTracker]   = useState(false)
  const [showChat, setShowChat]         = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const searchTimer = useRef(null)
  const unsubRide   = useRef(null)
  const unsubShared = useRef(null)

  const acc = VEHICLE_ACCENT[vehicle] || VEHICLE_ACCENT.auto
  const cfg = FARE_CONFIG[vehicle] || {}

  useEffect(() => { setSurge(getSurgeMultiplier()) }, [])
  useEffect(() => { if (!pickup) autoDetect() }, [])

  useEffect(() => {
    unsubShared.current?.()
    if (isShared && vehicle !== 'bike') unsubShared.current = subscribeToSharedRides(vehicle, setSharedRides)
    else setSharedRides([])
    return () => unsubShared.current?.()
  }, [isShared, vehicle])

  useEffect(() => {
    unsubRide.current?.()
    if (!rideId) return
    unsubRide.current = subscribeToRide(rideId, (d) => {
      setRideData(d)
      if (d.status === 'accepted' && step !== 'accepted') { setDriver(d.driverInfo); setStep('accepted'); toast('Driver found and on the way', 'success') }
      if (d.status === 'arrived')   { setStep('arrived');   toast('Driver has arrived', 'success') }
      if (d.status === 'ongoing')    setStep('ongoing')
      if (d.status === 'completed') { setStep('completed'); toast('Ride completed', 'success') }
      if (d.status === 'cancelled') { setStep('input'); setRideId(null); toast('Ride was cancelled', 'warning') }
    })
    return () => unsubRide.current?.()
  }, [rideId])

  const autoDetect = async () => {
    setLocating(true)
    try {
      const c = await getCurrentLocation()
      setPickupCoords(c)
      const addr = await reverseGeocode(c.lat, c.lng)
      setPickup(addr.split(',').slice(0,2).join(', '))
    } catch { toast('Could not detect location', 'warning') }
    setLocating(false)
  }

  const handleSearch = useCallback((q, type) => {
    clearTimeout(searchTimer.current)
    if (!q || q.trim().length < 2) { setSuggestions([]); return }
    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      try { setSuggestions((await searchLocations(q)).map(r => ({ ...r, inputType: type }))) }
      catch { setSuggestions([]) }
      setSearching(false)
    }, 280)
  }, [])

  const selectSuggestion = (s) => {
    if (s.inputType === 'pickup') { setPickup(s.name); setPickupCoords(s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null); setPickupMeta(s) }
    else { setDestination(s.name); setDestCoords(s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null); setDestMeta(s) }
    setSuggestions([])
  }

  const handleVehicleChange = (type) => {
    setVehicle(type)
    if (type === 'bike') setIsShared(false)
    navigate(`/book?vehicle=${type}`, { replace: true })
    if (step === 'select' && distance) setFare(calculateFare(distance, type, isShared, isShared ? 2 : 1))
  }

  const handleFindRide = async () => {
    if (!pickup.trim() || !destination.trim()) { toast('Enter pickup and destination', 'warning'); return }
    let pc = pickupCoords, dc = destCoords
    if (!pc) { try { const r = await searchLocations(pickup); if (r[0]?.lat) pc = { lat: r[0].lat, lng: r[0].lng } } catch {} }
    if (!dc) { try { const r = await searchLocations(destination); if (r[0]?.lat) dc = { lat: r[0].lat, lng: r[0].lng } } catch {} }
    if (!pc || !dc) { toast('Select locations from dropdown for accurate fare', 'warning'); return }
    if (pc) setPickupCoords(pc); if (dc) setDestCoords(dc)
    const dist = Math.max(calculateDistance(pc.lat, pc.lng, dc.lat, dc.lng), 0.5)
    setDistance(dist); setDuration(estimateDuration(dist, vehicle))
    setFare(calculateFare(dist, vehicle, isShared, isShared ? 2 : 1))
    setStep('select')
  }

  const handleBookRide = async () => {
    if (!user) { navigate('/login'); return }
    setLoading(true)
    try {
      const id = await createRide({
        userId: user.uid, userName: profile?.name || 'Rider', userPhone: profile?.phone || '',
        pickup, destination, pickupCoords, destCoords,
        pickupLocationId: pickupMeta?.id || null, destLocationId: destMeta?.id || null,
        pickupDistrict: pickupMeta?.district || null, destDistrict: destMeta?.district || null,
        vehicle, vehicleType: vehicle, isShared,
        distanceKm: parseFloat(distance?.toFixed(2)) || 0, fare, duration, surgeMultiplier: surge,
      })
      setRideId(id); setStep('searching'); toast('Looking for a driver…', 'info')
    } catch (e) { toast(e.message || 'Booking failed', 'error') }
    setLoading(false)
  }

  const handleCancelRide = async () => {
    setCancelLoading(true)
    try { if (rideId) await cancelRide(rideId, 'user'); toast('Ride cancelled', 'info') }
    catch { toast('Failed to cancel', 'error') }
    setCancelLoading(false)
    setRideId(null); setRideData(null); setDriver(null); setStep('input')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-14">
      <div className="container-wide py-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-5 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="grid lg:grid-cols-[360px_1fr] gap-5">

          {/* ── Booking panel ── */}
          <div className="space-y-4">
            <div className="card p-5 dark:bg-slate-900 dark:border-slate-800">
              <h1 className="font-semibold text-slate-900 dark:text-white mb-5">Book a ride</h1>

              {/* INPUT STEP */}
              {(step === 'input' || step === 'select') && (
                <>
                  {/* Location fields */}
                  <div className="space-y-2.5 mb-5 relative">
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-600 rounded-full pointer-events-none z-10" />
                      <input value={pickup} onChange={e => { setPickup(e.target.value); handleSearch(e.target.value,'pickup') }}
                        className="input input-with-icon pr-10" placeholder="Pickup location" />
                      <button onClick={autoDetect} disabled={locating} title="Detect my location"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors">
                        <Navigation size={15} className={locating ? 'animate-spin' : ''} />
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none z-10" />
                      <input value={destination} onChange={e => { setDestination(e.target.value); handleSearch(e.target.value,'destination') }}
                        className="input input-with-icon" placeholder="Where to?" />
                    </div>

                    {/* Suggestions */}
                    {(suggestions.length > 0 || searching) && (
                      <div className="absolute inset-x-0 top-full z-30 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {searching && (
                          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                            <Loader size={12} className="animate-spin" /> Searching…
                          </div>
                        )}
                        {suggestions.slice(0,6).map((s, i) => (
                          <button key={i} onClick={() => selectSuggestion(s)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors flex items-start gap-2.5">
                            <MapPin size={13} className={`mt-0.5 shrink-0 ${s.source === 'local' ? 'text-primary-500' : 'text-slate-300'}`} />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                              {s.tamilName && <p className="text-xs text-slate-400 truncate">{s.tamilName}</p>}
                              <p className="text-xs text-slate-400 truncate">{[s.district, s.state].filter(Boolean).join(', ')}</p>
                            </div>
                          </button>
                        ))}
                        <button onClick={() => setSuggestions([])} className="w-full text-xs text-center py-2 text-slate-400 hover:text-slate-600 border-t border-slate-100 dark:border-slate-800">
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Vehicle selector */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Vehicle</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(FARE_CONFIG).map(([type, c]) => {
                        const a = VEHICLE_ACCENT[type]
                        const sel = vehicle === type
                        return (
                          <button key={type} onClick={() => handleVehicleChange(type)}
                            className={`vehicle-option ${sel ? `vehicle-option-selected border-2 ${sel && type === 'bike' ? 'border-amber-400' : sel && type === 'auto' ? 'border-primary-500' : 'border-green-500'}` : ''}`}>
                            <span className="text-2xl">{c.icon}</span>
                            <p className={`text-xs font-semibold ${sel ? (a?.text || 'text-primary-700') : 'text-slate-700 dark:text-slate-300'}`}>{c.label}</p>
                            <p className="text-[10px] text-slate-400">₹{c.minFare}+</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shared toggle */}
                  {vehicle !== 'bike' && (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Share ride</p>
                        <p className="text-xs text-slate-500">Split fare with others</p>
                      </div>
                      <button onClick={() => setIsShared(!isShared)}
                        className={`toggle ${isShared ? 'toggle-on' : ''}`}
                        role="switch" aria-checked={isShared}>
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  )}

                  {step === 'input' && (
                    <button onClick={handleFindRide} disabled={!pickup || !destination}
                      className="btn btn-primary btn-lg w-full">
                      <Search size={15} /> Find rides
                    </button>
                  )}

                  {/* Fare summary */}
                  {step === 'select' && fare && (
                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Distance</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDistance(distance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Est. time</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{formatDuration(duration)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Vehicle</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{cfg.icon} {cfg.label}</span>
                          </div>
                          {surge > 1 && (
                            <div className="flex justify-between">
                              <span className="text-amber-700">Surge ({surge}×)</span>
                              <span className="text-amber-700 text-xs">Peak hours</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total fare</span>
                          <span className={`text-2xl font-bold ${acc.fare}`}>₹{fare}</span>
                        </div>
                        {isShared && <p className="text-xs text-slate-500 mt-1">Per person · shared</p>}
                      </div>
                      <button onClick={handleBookRide} disabled={loading}
                        className={`btn btn-lg w-full text-white ${acc.btn} transition-colors`}>
                        {loading ? <Loader size={15} className="animate-spin" /> : null}
                        {loading ? 'Booking…' : 'Confirm booking'}
                      </button>
                      <button onClick={() => setStep('input')} className="btn btn-secondary w-full">
                        Change options
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* SEARCHING */}
              {step === 'searching' && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-800">
                    <Loader size={22} className="text-primary-600 animate-spin" />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Finding your driver</p>
                  <p className="text-sm text-slate-500 mb-6">Matching with a nearby {vehicle} driver…</p>
                  <button onClick={handleCancelRide} disabled={cancelLoading}
                    className="btn btn-secondary mx-auto flex items-center gap-2">
                    {cancelLoading ? <Loader size={13} className="animate-spin" /> : <X size={13} />} Cancel
                  </button>
                </div>
              )}

              {/* DRIVER FOUND */}
              {(step === 'accepted' || step === 'arrived') && driver && (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                    step === 'arrived'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-primary-50 text-primary-700 border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800'
                  }`}>
                    <Check size={14} />
                    {step === 'arrived' ? 'Driver has arrived at pickup' : 'Driver confirmed and on the way'}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {driver.name?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{driver.name}</p>
                      <p className="text-xs text-slate-500 truncate">{driver.vehicle}</p>
                      {driver.rating > 0 && <p className="text-xs text-amber-700 font-medium mt-0.5">★ {Number(driver.rating).toFixed(1)}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setShowChat(true)} className="btn btn-secondary">💬 Message</button>
                    <button onClick={() => setShowPayment(true)} className="btn btn-primary">Pay ₹{fare}</button>
                  </div>
                  <button onClick={() => setShowTracker(true)} className="btn btn-ghost w-full text-primary-600 dark:text-primary-400">
                    Track on map →
                  </button>
                </div>
              )}

              {/* ONGOING */}
              {step === 'ongoing' && (
                <div className="text-center py-8 space-y-4">
                  <div className="text-4xl">{cfg.icon || '🚗'}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Ride in progress</p>
                    <p className="text-sm text-slate-500 mt-1">{driver?.name} is taking you to your destination</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setShowChat(true)} className="btn btn-secondary">💬 Chat</button>
                    <button onClick={() => setShowTracker(true)} className="btn btn-primary">Track ride</button>
                  </div>
                </div>
              )}

              {/* COMPLETED */}
              {step === 'completed' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto border-2 border-green-200">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Ride completed!</p>
                    <p className="text-sm text-slate-500 mt-1">Thank you for riding with us</p>
                  </div>
                  <button onClick={() => setShowFeedback(true)} className="btn btn-secondary w-full">Rate your driver</button>
                  <button onClick={() => { setStep('input'); setRideId(null); setDriver(null); setRideData(null) }}
                    className="btn btn-primary w-full">Book another ride</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Map + shared rides ── */}
          <div className="space-y-4">
            {/* Map */}
            <div className="card dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
              style={{ height: 'calc(100vh - 180px)', minHeight: '400px' }}>
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100/60 dark:bg-slate-800/40">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <MapPin size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Live map</p>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-[200px]">
                  Set <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> to enable
                </p>
              </div>
            </div>

            {/* Shared rides */}
            {isShared && vehicle !== 'bike' && (
              <SharedRideList rides={sharedRides} vehicle={vehicle} userId={user?.uid} />
            )}
          </div>
        </div>
      </div>

      {showPayment  && <PaymentModal fare={fare} rideId={rideId} onSuccess={() => { setShowPayment(false); try { updateRideStatus(rideId,'ongoing',{paymentStatus:'paid'}) } catch {} toast('Payment confirmed','success') }} onClose={() => setShowPayment(false)} />}
      {showTracker  && rideId && <RideTrackerModal rideId={rideId} driver={driver} onClose={() => setShowTracker(false)} />}
      {showChat     && rideId && <ChatModal rideId={rideId} driver={driver} onClose={() => setShowChat(false)} />}
      {showFeedback && rideId && driver && <FeedbackModal rideId={rideId} driverId={rideData?.driverId || ''} driverName={driver?.name} onClose={() => setShowFeedback(false)} />}
    </div>
  )
}
