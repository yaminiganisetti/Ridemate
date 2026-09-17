import { useState, useEffect, useCallback } from 'react'
import { Car, DollarSign, Star, Check, X, Loader, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDriverProfile, toggleDriverOnline } from '../../services/driverService'
import { getDriverRides, getPendingRides, updateRideStatus } from '../../services/rideService'
import { formatDate, STATUS_COLORS, STATUS_LABELS, VEHICLE_ICONS } from '../../utils/helpers'
import { createNotification } from '../../services/notificationService'

export default function DriverDashboard() {
  const { user } = useAuth()
  const [driver, setDriver] = useState(null)
  const [rides, setRides] = useState([])
  const [pendingRides, setPendingRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingOnline, setTogglingOnline] = useState(false)
  const [tab, setTab] = useState('requests')
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [driverData, rideData, pending] = await Promise.all([
        getDriverProfile(user.uid),
        getDriverRides(user.uid),
        getPendingRides(),
      ])
      setDriver(driverData)
      setRides(rideData)
      setPendingRides(pending)
    } catch (e) { console.error(e); setError('Failed to load dashboard') }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const handleToggleOnline = async () => {
    if (!driver) return
    setTogglingOnline(true)
    try {
      await toggleDriverOnline(user.uid, !driver.isOnline)
      setDriver(d => ({ ...d, isOnline: !d.isOnline }))
    } catch (e) { console.error(e) }
    setTogglingOnline(false)
  }

  const handleAccept = async (ride) => {
    setActionLoading(ride.id)
    try {
      await updateRideStatus(ride.id, 'accepted', {
        driverId: user.uid,
        driverInfo: {
          uid: user.uid,
          name: driver?.name,
          rating: driver?.rating,
          vehicle: `${driver?.vehicleModel} · ${driver?.vehicleNumber}`,
          avatar: '👨',
        }
      })
      await createNotification(ride.userId, 'ride_accepted', '🚗 Driver on the way!',
        `${driver?.name} has accepted your ride.`)
      setPendingRides(p => p.filter(r => r.id !== ride.id))
      setRides(r => [{ ...ride, status: 'accepted', driverId: user.uid }, ...r])
    } catch (e) { console.error(e) }
    setActionLoading(null)
  }

  const handleReject = async (ride) => {
    setActionLoading(ride.id + '_reject')
    try {
      await updateRideStatus(ride.id, 'searching')
      setPendingRides(p => p.filter(r => r.id !== ride.id))
    } catch (e) { console.error(e) }
    setActionLoading(null)
  }

  const handleComplete = async (ride) => {
    setActionLoading(ride.id + '_complete')
    try {
      await updateRideStatus(ride.id, 'completed')
      await createNotification(ride.userId, 'ride_completed', '✅ Ride Completed',
        'Your ride has been completed. Rate your driver!')
      setRides(r => r.map(rd => rd.id === ride.id ? { ...rd, status: 'completed' } : rd))
    } catch (e) { console.error(e) }
    setActionLoading(null)
  }

  const completedRides = rides.filter(r => r.status === 'completed')
  const totalEarnings = completedRides.reduce((s, r) => s + (r.fare || 0), 0)
  const todayEarnings = completedRides
    .filter(r => {
      const d = r.createdAt?.toDate?.() || new Date(r.createdAt)
      return d.toDateString() === new Date().toDateString()
    })
    .reduce((s, r) => s + (r.fare || 0), 0)

  if (driver?.status === 'pending') return <PendingApproval />
  if (driver?.status === 'rejected') return <RejectedState />

  const TABS = [
    { id: 'requests', label: `Requests${pendingRides.length > 0 ? ` (${pendingRides.length})` : ''}` },
    { id: 'active', label: 'Active Rides' },
    { id: 'history', label: 'History' },
    { id: 'earnings', label: 'Earnings' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-3xl">
            {VEHICLE_ICONS[driver?.vehicleType] || '🚗'}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink-900">{driver?.name}</h2>
            <p className="text-sm text-ink-400">{driver?.vehicleModel} · {driver?.vehicleNumber}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-brand-400 text-sm">★</span>
                <span className="text-sm font-semibold text-ink-700">{driver?.rating?.toFixed(1) || '—'}</span>
              </div>
              <span className="text-xs text-ink-400">({driver?.ratingCount || 0} ratings)</span>
            </div>
          </div>
        </div>
        {/* Online toggle */}
        <div className="flex flex-col items-center gap-1.5">
          <button onClick={handleToggleOnline} disabled={togglingOnline}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${driver?.isOnline ? 'bg-emerald-500' : 'bg-ink-300'}`}>
            {togglingOnline
              ? <Loader size={14} className="absolute inset-0 m-auto text-white animate-spin" />
              : <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${driver?.isOnline ? 'translate-x-9' : 'translate-x-1'}`} />
            }
          </button>
          <span className={`text-xs font-semibold ${driver?.isOnline ? 'text-emerald-600' : 'text-ink-400'}`}>
            {driver?.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: Zap, color: 'bg-amber-100 text-amber-600' },
          { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Total Rides', value: completedRides.length, icon: Car, color: 'bg-blue-100 text-blue-600' },
          { label: 'Avg Rating', value: driver?.rating?.toFixed(1) || '—', icon: Star, color: 'bg-brand-100 text-brand-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm">
            <div className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center mb-2.5`}>
              <Icon size={16} />
            </div>
            <p className="font-display font-bold text-xl text-ink-900">{value}</p>
            <p className="text-xs text-ink-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        <div className="flex border-b border-ink-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-max py-3.5 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/30' : 'text-ink-500 hover:text-ink-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Ride Requests */}
          {tab === 'requests' && (
            <div className="space-y-4">
              <p className="text-xs text-ink-400 font-medium">
                {driver?.isOnline ? 'Showing nearby ride requests' : '⚠️ Go online to receive requests'}
              </p>
              {loading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
              ) : pendingRides.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="font-semibold text-ink-700">No pending requests</p>
                  <p className="text-sm text-ink-400 mt-1">
                    {driver?.isOnline ? 'Waiting for new ride requests…' : 'Toggle online to start receiving requests'}
                  </p>
                </div>
              ) : (
                pendingRides.map(ride => (
                  <RideRequestCard key={ride.id} ride={ride}
                    onAccept={() => handleAccept(ride)}
                    onReject={() => handleReject(ride)}
                    accepting={actionLoading === ride.id}
                    rejecting={actionLoading === ride.id + '_reject'}
                  />
                ))
              )}
            </div>
          )}

          {/* Active */}
          {tab === 'active' && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2">{[1,2].map(i=><div key={i} className="h-24 shimmer rounded-2xl"/>)}</div>
              ) : rides.filter(r => ['accepted', 'ongoing'].includes(r.status)).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🚗</div>
                  <p className="font-semibold text-ink-700">No active rides</p>
                  <p className="text-sm text-ink-400 mt-1">Accept a ride request to see it here</p>
                </div>
              ) : (
                rides.filter(r => ['accepted', 'ongoing'].includes(r.status)).map(ride => (
                  <ActiveRideCard key={ride.id} ride={ride}
                    onComplete={() => handleComplete(ride)}
                    completing={actionLoading === ride.id + '_complete'}
                  />
                ))
              )}
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
              ) : rides.filter(r => r.status === 'completed').length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="font-semibold text-ink-700">No completed rides yet</p>
                </div>
              ) : (
                rides.filter(r => r.status === 'completed').map(ride => (
                  <div key={ride.id} className="flex items-center gap-3 p-4 bg-ink-50 rounded-2xl">
                    <span className="text-xl">{VEHICLE_ICONS[ride.vehicle] || '🚗'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate">{ride.pickup} → {ride.destination}</p>
                      <p className="text-xs text-ink-400">{formatDate(ride.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">+₹{ride.fare}</p>
                      <p className="text-xs text-ink-400">{ride.distance}km</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Earnings */}
          {tab === 'earnings' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={18} className="text-emerald-200" />
                  <span className="text-emerald-100 text-sm">Total Earnings</span>
                </div>
                <p className="font-display font-bold text-4xl">₹{totalEarnings}</p>
                <p className="text-emerald-200 text-sm mt-1">{completedRides.length} rides completed</p>
              </div>

              {/* Weekly breakdown (demo) */}
              <div>
                <h4 className="font-display font-semibold text-ink-800 mb-3 text-sm">Recent Transactions</h4>
                {loading ? (
                  <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 shimmer rounded-xl"/>)}</div>
                ) : completedRides.slice(0, 10).length === 0 ? (
                  <div className="text-center py-8 text-ink-400">
                    <p className="text-sm font-medium">No earnings yet</p>
                    <p className="text-xs mt-1">Complete rides to see your earnings here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedRides.slice(0, 10).map(ride => (
                      <div key={ride.id} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-ink-800 truncate max-w-[200px]">
                            {ride.pickup} → {ride.destination}
                          </p>
                          <p className="text-xs text-ink-400">{formatDate(ride.createdAt)}</p>
                        </div>
                        <span className="font-bold text-emerald-600">+₹{ride.fare}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RideRequestCard({ ride, onAccept, onReject, accepting, rejecting }) {
  return (
    <div className="border-2 border-brand-200 bg-brand-50/40 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{VEHICLE_ICONS[ride.vehicle] || '🚗'}</span>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold capitalize">{ride.vehicle}</span>
            {ride.isShared && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Shared</span>}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink-800 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
              {ride.pickup}
            </p>
            <p className="text-sm text-ink-600 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-brand-500 rounded-full inline-block" />
              {ride.destination}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-2xl text-brand-600">₹{ride.fare}</p>
          <p className="text-xs text-ink-400">{ride.distance}km</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onReject} disabled={rejecting || accepting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
          {rejecting ? <Loader size={14} className="animate-spin" /> : <X size={14} />} Decline
        </button>
        <button onClick={onAccept} disabled={accepting || rejecting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
          {accepting ? <Loader size={14} className="animate-spin" /> : <Check size={14} />} Accept
        </button>
      </div>
    </div>
  )
}

function ActiveRideCard({ ride, onComplete, completing }) {
  return (
    <div className="border-2 border-blue-200 bg-blue-50/40 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-xs font-semibold text-blue-700">Active Ride</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ride.status]}`}>
          {STATUS_LABELS[ride.status]}
        </span>
      </div>
      <p className="text-sm font-semibold text-ink-800 mb-1">{ride.pickup} → {ride.destination}</p>
      <p className="text-xs text-ink-400 mb-1">{ride.userName} · {ride.userPhone}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="font-bold text-brand-600">₹{ride.fare}</span>
        <button onClick={onComplete} disabled={completing}
          className="flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50">
          {completing ? <Loader size={13} className="animate-spin" /> : <Check size={13} />} Complete
        </button>
      </div>
    </div>
  )
}

function PendingApproval() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Pending Approval</h2>
        <p className="text-ink-400 text-sm">Your driver application is being reviewed. You'll be notified once approved.</p>
      </div>
    </div>
  )
}

function RejectedState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Application Not Approved</h2>
        <p className="text-ink-400 text-sm mb-5">Your application was rejected. Contact support for more information.</p>
        <a href="mailto:support@ridemate.in" className="btn-primary inline-block">Contact Support</a>
      </div>
    </div>
  )
}
