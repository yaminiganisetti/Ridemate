import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Search, Loader, Check, ArrowLeft, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  FARE_CONFIG, calculateFare, createRide,
  subscribeToRide, updateRideStatus, cancelRide, subscribeToSharedRides
} from '../../services/rideService'
import { getSurgeMultiplier } from '../../utils/pricing'
import { calculateDistance, getCurrentLocation, reverseGeocode, estimateDuration, formatDistance, formatDuration } from '../../utils/mapUtils'
import { searchLocations } from '../../utils/locationSearch'
import { STATUS_LABELS } from '../../utils/helpers'
import PaymentModal from '../../components/booking/PaymentModal'
import RideTrackerModal from '../../components/booking/RideTrackerModal'
import FeedbackModal from '../../components/booking/FeedbackModal'
import SharedRideList from '../../components/shared/SharedRideList'
import ChatModal from '../../components/chat/ChatModal'

// Vehicle accent themes
const VEHICLE_THEME = {
  bike: { gradient: 'from-amber-400 to-orange-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'ring-amber-400', selected: 'border-amber-400 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  auto: { gradient: 'from-blue-400 to-sky-500',     light: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-700',  ring: 'ring-blue-400',  selected: 'border-blue-400 bg-blue-50',  badge: 'bg-blue-100 text-blue-700'  },
  car:  { gradient: 'from-emerald-400 to-teal-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-400', selected: 'border-emerald-400 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
}

export default function BookingPage() {
  const routerLoc = useLocation()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()
  const { toast } = useToast()

  const urlVehicle  = searchParams.get('vehicle')
  const initVehicle = ['bike', 'auto', 'car'].includes(urlVehicle) ? urlVehicle : 'auto'

  // Form
  const [pickup, setPickup]           = useState(routerLoc.state?.pickup || '')
  const [destination, setDestination] = useState(routerLoc.state?.destination || '')
  const [pickupCoords, setPickupCoords]   = useState(null)
  const [destCoords, setDestCoords]       = useState(null)
  const [pickupMeta, setPickupMeta]       = useState(null)
  const [destMeta, setDestMeta]           = useState(null)
  const [vehicle, setVehicle]         = useState(initVehicle)
  const [isShared, setIsShared]       = useState(false)

  // Search
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching]     = useState(false)

  // Booking flow
  const [step, setStep]         = useState('input')
  const [distance, setDistance] = useState(null)
  const [fare, setFare]         = useState(null)
  const [duration, setDuration] = useState(null)
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0)
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

  const theme = VEHICLE_THEME[vehicle] || VEHICLE_THEME.auto

  useEffect(() => { setSurgeMultiplier(getSurgeMultiplier()) }, [])
  useEffect(() => { if (!pickup) autoDetect() }, [])

  useEffect(() => {
    unsubShared.current?.()
    if (isShared && vehicle !== 'bike') {
      unsubShared.current = subscribeToSharedRides(vehicle, setSharedRides)
    } else setSharedRides([])
    return () => unsubShared.current?.()
  }, [isShared, vehicle])

  useEffect(() => {
    unsubRide.current?.()
    if (!rideId) return
    unsubRide.current = subscribeToRide(rideId, (data) => {
      setRideData(data)
      if (data.status === 'accepted' && step !== 'accepted') { setDriver(data.driverInfo); setStep('accepted'); toast('🚗 Driver found! On the way.', 'success') }
      if (data.status === 'arrived')   { setStep('arrived');   toast('📍 Driver has arrived!', 'success') }
      if (data.status === 'ongoing')    setStep('ongoing')
      if (data.status === 'completed') { setStep('completed'); toast('✅ Ride completed!', 'success') }
      if (data.status === 'cancelled') { setStep('input'); setRideId(null); toast('Ride cancelled', 'warning') }
    })
    return () => unsubRide.current?.()
  }, [rideId])

  const autoDetect = async () => {
    setLocating(true)
    try {
      const c = await getCurrentLocation()
      setPickupCoords(c)
      const addr = await reverseGeocode(c.lat, c.lng)
      setPickup(addr.split(',').slice(0, 2).join(', '))
    } catch { toast('Could not detect location. Type your pickup.', 'warning') }
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
    }, 300)
  }, [])

  const selectSuggestion = (s) => {
    const display = s.name
    if (s.inputType === 'pickup') { setPickup(display); setPickupCoords(s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null); setPickupMeta(s) }
    else                          { setDestination(display); setDestCoords(s.lat && s.lng ? { lat: s.lat, lng: s.lng } : null); setDestMeta(s) }
    setSuggestions([])
  }

  const handleFindRide = async () => {
    if (!pickup.trim() || !destination.trim()) { toast('Enter both pickup and destination', 'warning'); return }
    let pc = pickupCoords, dc = destCoords
    if (!pc) { try { const r = await searchLocations(pickup); if (r[0]?.lat) pc = { lat: r[0].lat, lng: r[0].lng } } catch {} }
    if (!dc) { try { const r = await searchLocations(destination); if (r[0]?.lat) dc = { lat: r[0].lat, lng: r[0].lng } } catch {} }
    if (!pc || !dc) { toast('Select locations from suggestions to calculate distance', 'warning'); return }
    if (pc) setPickupCoords(pc)
    if (dc) setDestCoords(dc)
    const dist = Math.max(calculateDistance(pc.lat, pc.lng, dc.lat, dc.lng), 0.5)
    setDistance(dist)
    setDuration(estimateDuration(dist, vehicle))
    setFare(calculateFare(dist, vehicle, isShared, isShared ? 2 : 1))
    setStep('select')
  }

  const handleVehicleChange = (type) => {
    setVehicle(type)
    if (type === 'bike') setIsShared(false)
    navigate(`/book?vehicle=${type}`, { replace: true })
    // Recalculate fare if already in select step
    if (step === 'select' && distance) {
      setFare(calculateFare(distance, type, isShared, isShared ? 2 : 1))
    }
  }

  const handleBookRide = async () => {
    if (!user) { navigate('/login'); return }
    setLoading(true)
    try {
      const id = await createRide({
        userId: user.uid, userName: profile?.name || 'Rider', userPhone: profile?.phone || '',
        pickup, destination,
        pickupCoords: pickupCoords || null, destCoords: destCoords || null,
        pickupLocationId: pickupMeta?.id || null, destLocationId: destMeta?.id || null,
        pickupDistrict: pickupMeta?.district || null, destDistrict: destMeta?.district || null,
        vehicle, vehicleType: vehicle, isShared,
        distanceKm: parseFloat(distance?.toFixed(2)) || 0,
        fare, duration, surgeMultiplier,
      })
      setRideId(id)
      setStep('searching')
      toast('Looking for drivers nearby…', 'info')
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

  const surgeActive = surgeMultiplier > 1.0

  return (
    <div className="min-h-screen bg-ink-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ink-500 hover:text-ink-900 mb-6 text-sm font-medium transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── BOOKING CARD ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-card border border-ink-100/60 overflow-hidden">
              {/* Colored header strip */}
              <div className={`h-1.5 bg-gradient-to-r ${theme.gradient} w-full`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-xl text-ink-900">Book a Ride</h2>
                  {surgeActive && (
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      ⚡ {((surgeMultiplier - 1) * 100).toFixed(0)}% surge
                    </span>
                  )}
                </div>

                {/* ── INPUT STEP ── */}
                {(step === 'input' || step === 'select') && (
                  <>
                    {/* Location fields */}
                    <div className="space-y-3 mb-6 relative">
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full pointer-events-none z-10" />
                        <input value={pickup}
                          onChange={e => { setPickup(e.target.value); handleSearch(e.target.value, 'pickup') }}
                          onFocus={() => {}}
                          placeholder="Pickup location" className="input-field pl-9 pr-10" />
                        <button onClick={autoDetect} disabled={locating} title="Detect location"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors">
                          <Navigation size={15} className={locating ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none z-10" />
                        <input value={destination}
                          onChange={e => { setDestination(e.target.value); handleSearch(e.target.value, 'destination') }}
                          placeholder="Where to?" className="input-field pl-9" />
                      </div>

                      {/* Suggestions */}
                      {(suggestions.length > 0 || searching) && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-white rounded-2xl shadow-card-hover border border-ink-100/80 overflow-hidden mt-1">
                          {searching && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-ink-400">
                              <Loader size={13} className="animate-spin" /> Searching…
                            </div>
                          )}
                          {suggestions.map((s, i) => (
                            <button key={i} onClick={() => selectSuggestion(s)}
                              className="w-full text-left px-4 py-3 hover:bg-ink-50 border-b border-ink-50 last:border-0 flex items-start gap-2.5 transition-colors">
                              <MapPin size={12} className={`mt-0.5 shrink-0 ${s.source === 'local' ? 'text-brand-400' : 'text-ink-300'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-ink-800 truncate">{s.name}</p>
                                {s.tamilName && <p className="text-xs text-ink-400">{s.tamilName}</p>}
                                <p className="text-xs text-ink-300 truncate">{s.district}{s.state ? `, ${s.state}` : ''}</p>
                              </div>
                            </button>
                          ))}
                          <button onClick={() => setSuggestions([])} className="w-full text-center py-2 text-xs text-ink-300 hover:text-ink-500 border-t border-ink-50">
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Vehicle selector */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3 font-mono">Select Vehicle</p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {Object.entries(FARE_CONFIG).map(([type, cfg]) => {
                          const t = VEHICLE_THEME[type]
                          const sel = vehicle === type
                          return (
                            <button key={type}
                              onClick={() => handleVehicleChange(type)}
                              className={`p-3.5 rounded-2xl border-2 text-center transition-all duration-200 ${
                                sel ? `${t.selected} shadow-sm scale-[1.03]` : 'border-ink-200 bg-white hover:border-ink-300'
                              }`}>
                              <span className="text-2xl block mb-1.5">{cfg.icon}</span>
                              <p className={`text-xs font-bold ${sel ? t.text : 'text-ink-700'}`}>{cfg.label}</p>
                              <p className="text-[10px] text-ink-400 mt-0.5">₹{cfg.minFare}+</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Shared toggle */}
                    {vehicle !== 'bike' && (
                      <div className={`flex items-center justify-between p-4 ${theme.light} border ${theme.border} rounded-2xl mb-6`}>
                        <div>
                          <p className="text-sm font-semibold text-ink-800">Shared Ride</p>
                          <p className="text-xs text-ink-400">Split fare · Save up to 50%</p>
                        </div>
                        <button onClick={() => setIsShared(!isShared)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${isShared ? `bg-gradient-to-r ${theme.gradient}` : 'bg-ink-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${isShared ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    )}

                    {step === 'input' && (
                      <button onClick={handleFindRide} disabled={!pickup || !destination}
                        className={`w-full flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-2xl disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-r ${theme.gradient} shadow-sm hover:shadow-md`}>
                        <Search size={15} /> Find Rides
                      </button>
                    )}

                    {/* Fare card */}
                    {step === 'select' && fare && (
                      <div className="space-y-4">
                        {(!pickupCoords || !destCoords) && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                            <AlertCircle size={13} className="mt-0.5 shrink-0" />
                            Distance estimated — exact fare on pickup
                          </div>
                        )}
                        <div className={`${theme.light} border ${theme.border} rounded-2xl p-4`}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-ink-500">Distance</span>
                            <span className="font-semibold text-ink-900">{formatDistance(distance)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-ink-500">Est. time</span>
                            <span className="font-semibold text-ink-900">{formatDuration(duration)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-ink-500">Vehicle</span>
                            <span className={`font-semibold ${theme.text} capitalize`}>{FARE_CONFIG[vehicle]?.icon} {vehicle}</span>
                          </div>
                          {surgeActive && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-amber-600 font-medium">Surge ({surgeMultiplier}×)</span>
                              <span className="text-amber-600 text-xs">Peak hours</span>
                            </div>
                          )}
                          <div className={`flex justify-between border-t ${theme.border} pt-2.5 mt-2`}>
                            <span className="text-sm font-semibold text-ink-800">Total Fare</span>
                            <span className={`font-display font-bold text-3xl ${theme.text}`}>₹{fare}</span>
                          </div>
                          {isShared && <p className={`text-xs ${theme.text} mt-1 font-medium`}>Per person · shared</p>}
                        </div>
                        <button onClick={handleBookRide} disabled={loading}
                          className={`w-full flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-2xl disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-r ${theme.gradient} shadow-sm hover:shadow-md`}>
                          {loading ? <><Loader size={15} className="animate-spin" /> Booking…</> : 'Confirm Booking'}
                        </button>
                        <button onClick={() => setStep('input')} className="btn-secondary w-full text-sm py-2.5">← Change Options</button>
                      </div>
                    )}
                  </>
                )}

                {/* ── SEARCHING ── */}
                {step === 'searching' && (
                  <div className="text-center py-10">
                    <div className={`w-16 h-16 rounded-full ${theme.light} border-2 ${theme.border} flex items-center justify-center mx-auto mb-4`}>
                      <Loader size={26} className={`${theme.text} animate-spin`} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-2">Finding your {vehicle}</h3>
                    <p className="text-ink-400 text-sm mb-6">Matching with a nearby {vehicle} driver…</p>
                    <div className="flex justify-center gap-1.5 mb-6">
                      {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} animate-bounce`} style={{ animationDelay: `${i*0.2}s` }} />)}
                    </div>
                    <button onClick={handleCancelRide} disabled={cancelLoading}
                      className="btn-secondary text-sm px-6 flex items-center gap-2 mx-auto">
                      {cancelLoading ? <Loader size={13} className="animate-spin" /> : <X size={13} />} Cancel
                    </button>
                  </div>
                )}

                {/* ── ACCEPTED / ARRIVED ── */}
                {(step === 'accepted' || step === 'arrived') && driver && (
                  <div>
                    <div className={`${step === 'arrived' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'} border rounded-2xl p-3 mb-4 flex items-center gap-2`}>
                      <Check size={15} className={step === 'arrived' ? 'text-blue-500' : 'text-emerald-500'} />
                      <div>
                        <p className={`font-semibold text-sm ${step === 'arrived' ? 'text-blue-800' : 'text-emerald-800'}`}>
                          {step === 'arrived' ? 'Driver has arrived!' : 'Driver found!'}
                        </p>
                        <p className="text-xs opacity-70">{step === 'arrived' ? 'Please proceed to pickup' : 'On the way to you'}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3.5 ${theme.light} border ${theme.border} rounded-2xl mb-4`}>
                      <div className={`w-11 h-11 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0`}>
                        {driver.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink-900">{driver.name}</p>
                        <p className="text-xs text-ink-400 truncate">{driver.vehicle}</p>
                        {driver.rating > 0 && <p className={`text-xs font-semibold ${theme.text} mt-0.5`}>★ {Number(driver.rating).toFixed(1)}</p>}
                      </div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button onClick={() => setShowChat(true)} className="btn-secondary text-sm py-2.5 rounded-2xl">💬 Message</button>
                      <button onClick={() => setShowPayment(true)} className={`flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white text-sm font-semibold py-2.5 px-4 rounded-2xl hover:-translate-y-0.5 transition-all shadow-sm`}>💳 Pay ₹{fare}</button>
                    </div>
                    <button onClick={() => setShowTracker(true)} className={`w-full text-center text-sm ${theme.text} hover:opacity-80 font-semibold py-1.5 transition-opacity`}>
                      🗺️ Track on map →
                    </button>
                  </div>
                )}

                {/* ── ONGOING ── */}
                {step === 'ongoing' && (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3 animate-bounce">{FARE_CONFIG[vehicle]?.icon || '🚗'}</div>
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-2">Ride in Progress</h3>
                    <p className="text-ink-400 text-sm mb-5">{driver?.name} is taking you to your destination</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setShowChat(true)} className="btn-secondary text-sm py-2.5">💬 Chat</button>
                      <button onClick={() => setShowTracker(true)} className={`flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white text-sm font-semibold py-2.5 px-4 rounded-2xl hover:-translate-y-0.5 transition-all shadow-sm`}>🗺️ Track</button>
                    </div>
                  </div>
                )}

                {/* ── COMPLETED ── */}
                {step === 'completed' && (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}>
                      <Check size={28} className="text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Ride Completed!</h3>
                    <p className="text-ink-400 text-sm mb-5">Hope you enjoyed your ride with {driver?.name}!</p>
                    <button onClick={() => setShowFeedback(true)} className="btn-secondary w-full mb-3 text-sm">⭐ Rate Driver</button>
                    <button onClick={() => { setStep('input'); setRideId(null); setDriver(null); setRideData(null) }}
                      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white font-semibold py-3 rounded-2xl hover:-translate-y-0.5 transition-all shadow-sm`}>
                      Book Another Ride
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Map area */}
            <div className={`rounded-3xl border ${theme.border} overflow-hidden h-72 lg:h-[420px] relative ${theme.light}`}>
              <div aria-hidden className="absolute inset-0 line-grid opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center mb-3 shadow-md`}>
                  <span className="text-2xl">{FARE_CONFIG[vehicle]?.icon || '🗺️'}</span>
                </div>
                <p className="font-display font-semibold text-ink-700">Live Map</p>
                <p className="text-ink-400 text-xs mt-1 max-w-[220px] text-center">
                  Add <code className="bg-white/60 px-1 rounded text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> to enable
                </p>
              </div>
              {step !== 'input' && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full shrink-0" />
                  <div className={`flex-1 border-t-2 border-dashed opacity-50 ${theme.border}`} />
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.gradient} shrink-0`} />
                </div>
              )}
              {step === 'searching' && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="glass rounded-2xl p-3 text-sm font-medium text-ink-700 flex items-center gap-2 border border-white/60 shadow-sm">
                    <Loader size={13} className={`${theme.text} animate-spin`} /> Searching for {vehicle} drivers…
                  </div>
                </div>
              )}
            </div>

            {/* Shared rides */}
            {isShared && vehicle !== 'bike' && (
              <SharedRideList rides={sharedRides} vehicle={vehicle} userId={user?.uid} />
            )}

            {/* Driver info */}
            {['accepted','arrived','ongoing'].includes(step) && driver && (
              <div className="bg-white rounded-3xl shadow-card border border-ink-100/60 p-5">
                <h3 className="font-display font-semibold text-ink-900 mb-3 text-sm">Your Driver</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center text-2xl font-bold text-white`}>
                    {driver.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900">{driver.name}</p>
                    <p className="text-sm text-ink-400">{driver.vehicle}</p>
                    {driver.phone && <p className="text-xs text-ink-400 mt-0.5">{driver.phone}</p>}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold block mb-1 ${theme.badge}`}>
                      {STATUS_LABELS[step] || step}
                    </span>
                    {driver.rating > 0 && <p className={`text-xs font-semibold ${theme.text}`}>★ {Number(driver.rating).toFixed(1)}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayment  && <PaymentModal fare={fare} rideId={rideId} onSuccess={() => { setShowPayment(false); try { updateRideStatus(rideId, 'ongoing', { paymentStatus: 'paid' }) } catch {} toast('Payment confirmed!', 'success') }} onClose={() => setShowPayment(false)} />}
      {showTracker  && rideId && <RideTrackerModal rideId={rideId} driver={driver} onClose={() => setShowTracker(false)} />}
      {showChat     && rideId && <ChatModal rideId={rideId} driver={driver} onClose={() => setShowChat(false)} />}
      {showFeedback && rideId && driver && <FeedbackModal rideId={rideId} driverId={rideData?.driverId || ''} driverName={driver?.name} onClose={() => setShowFeedback(false)} />}
    </div>
  )
}
