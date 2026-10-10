import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, MapPin, DollarSign, Star, ArrowRight, Plus, Loader, History } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getUserRides } from '../../services/rideService'
import { updateUserProfile } from '../../services/authService'
import { formatDate, STATUS_LABELS, VEHICLE_ICONS } from '../../utils/helpers'

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="skeleton w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="skeleton h-5 w-14 rounded-md" />
    </div>
  )
}

function StatusBadge({ status }) {
  const MAP = {
    completed: 'badge-green',
    cancelled: 'badge-red',
    ongoing:   'badge-blue',
    accepted:  'badge-blue',
    searching: 'badge-amber',
  }
  return (
    <span className={`badge ${MAP[status] || 'badge-slate'} capitalize`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function RideRow({ ride }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-lg shrink-0">
        {VEHICLE_ICONS[ride.vehicle] || '🚗'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          {ride.pickup} → {ride.destination}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(ride.createdAt)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {ride.fare && <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{ride.fare}</span>}
        <StatusBadge status={ride.status} />
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast }  = useToast()
  const navigate   = useNavigate()
  const [tab, setTab]         = useState('overview')
  const [rides, setRides]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [addingPlace, setAddingPlace] = useState(false)
  const [newPlace, setNewPlace]       = useState({ label: '', address: '' })
  const [savingPlace, setSavingPlace] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true); setError(null)
    getUserRides(user.uid)
      .then(r => { setRides(r.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))); setLoading(false) })
      .catch(() => { setError('Failed to load rides. Please refresh.'); setLoading(false) })
  }, [user])

  const completed  = rides.filter(r => r.status === 'completed')
  const totalSpent = completed.reduce((s, r) => s + (Number(r.fare) || 0), 0)

  const handleSavePlace = async () => {
    if (!newPlace.label.trim() || !newPlace.address.trim()) { toast('Fill in both fields', 'warning'); return }
    setSavingPlace(true)
    try {
      const existing = profile?.savedLocations || []
      await updateUserProfile(user.uid, { savedLocations: [...existing, { ...newPlace, id: Date.now().toString() }] })
      await refreshProfile()
      setNewPlace({ label: '', address: '' }); setAddingPlace(false); toast('Place saved', 'success')
    } catch { toast('Failed to save place', 'error') }
    setSavingPlace(false)
  }

  const handleRemovePlace = async (id) => {
    try {
      await updateUserProfile(user.uid, { savedLocations: (profile?.savedLocations||[]).filter(l=>l.id!==id) })
      await refreshProfile(); toast('Place removed', 'info')
    } catch { toast('Failed', 'error') }
  }

  const TABS = ['Overview', 'History', 'Payments', 'Saved Places']

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Welcome */}
      <div className="bg-primary-600 rounded-2xl p-6 text-white">
        <p className="text-primary-200 text-sm mb-1">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'},
        </p>
        <h1 className="text-2xl font-bold mb-4">{profile?.name?.split(' ')[0] || 'Rider'}</h1>
        <button onClick={() => navigate('/book')}
          className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
          <Car size={15} /> Book a ride <ArrowRight size={13} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading
          ? [1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)
          : [
              { label: 'Total Rides',  value: completed.length,            icon: Car,         color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' },
              { label: 'Total Spent',  value: `₹${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
              { label: 'Avg Rating',   value: completed.length ? '4.9' : '—', icon: Star,      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
              { label: 'Shared Rides', value: rides.filter(r=>r.isShared).length, icon: MapPin, color: 'text-accent-500 bg-accent-50 dark:bg-cyan-900/30' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4 dark:bg-slate-900 dark:border-slate-800">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${color}`}>
                  <Icon size={15} />
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))
        }
      </div>

      {/* Tab card */}
      <div className="card dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase().replace(' ', '-'))}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                tab === t.toLowerCase().replace(' ', '-')
                  ? 'text-primary-600 border-primary-600 dark:text-primary-400'
                  : 'text-slate-500 border-transparent hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}>{t}</button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent rides</h3>
                {rides.length > 0 && (
                  <button onClick={() => setTab('history')}
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
                    View all
                  </button>
                )}
              </div>
              {loading
                ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{[1,2,3].map(i=><SkeletonRow key={i}/>)}</div>
                : error ? <p className="text-sm text-red-600 text-center py-8">{error}</p>
                : rides.length === 0
                  ? <div className="text-center py-12">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Car size={20} className="text-slate-300" />
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No rides yet</p>
                      <p className="text-sm text-slate-400 mb-4">Your journey history will appear here</p>
                      <button onClick={() => navigate('/book')} className="btn btn-primary btn-sm">Book your first ride</button>
                    </div>
                  : <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-5">
                      {rides.slice(0,5).map(r => <RideRow key={r.id} ride={r} />)}
                    </div>
              }
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All rides ({rides.length})</h3>
              </div>
              {loading
                ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{[1,2,3,4].map(i=><SkeletonRow key={i}/>)}</div>
                : error ? <p className="text-sm text-red-600 text-center py-8">{error}</p>
                : rides.length === 0
                  ? <div className="text-center py-12">
                      <History size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No ride history</p>
                      <p className="text-sm text-slate-400">Rides will appear here once you complete them</p>
                    </div>
                  : <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-5">
                      {rides.map(r => <RideRow key={r.id} ride={r} />)}
                    </div>
              }
            </div>
          )}

          {/* Payments */}
          {tab === 'payments' && (
            <div>
              <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white mb-5">
                <p className="text-slate-400 text-xs mb-1">Total spent</p>
                <p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
                <p className="text-slate-400 text-xs mt-1">{completed.length} completed {completed.length === 1 ? 'ride' : 'rides'}</p>
              </div>
              {loading
                ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
                : rides.filter(r=>r.fare).length === 0
                  ? <div className="text-center py-10">
                      <DollarSign size={28} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No transactions yet</p>
                      <p className="text-sm text-slate-400">Completed ride payments will appear here</p>
                    </div>
                  : <div className="space-y-2">
                      {rides.filter(r=>r.fare).map(ride => (
                        <div key={ride.id} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <span className="text-xl shrink-0">{VEHICLE_ICONS[ride.vehicle]||'🚗'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{ride.pickup} → {ride.destination}</p>
                            <p className="text-xs text-slate-400">{formatDate(ride.createdAt)}</p>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{ride.fare}</span>
                        </div>
                      ))}
                    </div>
              }
            </div>
          )}

          {/* Saved Places */}
          {tab === 'saved-places' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Saved places</h3>
                <button onClick={() => setAddingPlace(!addingPlace)}
                  className="btn btn-sm btn-secondary flex items-center gap-1.5">
                  <Plus size={12} /> Add place
                </button>
              </div>

              {addingPlace && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
                  <input value={newPlace.label} onChange={e=>setNewPlace(p=>({...p,label:e.target.value}))}
                    className="input" placeholder="Label (e.g. Home, Office)" />
                  <input value={newPlace.address} onChange={e=>setNewPlace(p=>({...p,address:e.target.value}))}
                    className="input" placeholder="Full address" />
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingPlace(false); setNewPlace({ label:'', address:'' }) }}
                      className="btn btn-secondary flex-1">Cancel</button>
                    <button onClick={handleSavePlace} disabled={savingPlace}
                      className="btn btn-primary flex-1">
                      {savingPlace && <Loader size={13} className="animate-spin" />} Save
                    </button>
                  </div>
                </div>
              )}

              {(!profile?.savedLocations || profile.savedLocations.length === 0) && !addingPlace
                ? <div className="text-center py-12">
                    <MapPin size={28} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No saved places</p>
                    <p className="text-sm text-slate-400 mb-4">Save home, office and frequent destinations</p>
                    <button onClick={() => setAddingPlace(true)} className="btn btn-secondary btn-sm flex items-center gap-1.5 mx-auto">
                      <Plus size={12} /> Add a place
                    </button>
                  </div>
                : <div className="space-y-2">
                    {(profile?.savedLocations||[]).map(loc => (
                      <div key={loc.id} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl group">
                        <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{loc.label}</p>
                          <p className="text-xs text-slate-400 truncate">{loc.address}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate('/book', { state: { pickup: loc.address } })}
                            className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">Book →</button>
                          <button onClick={() => handleRemovePlace(loc.id)}
                            className="text-xs text-red-600 hover:underline">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
