import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, MapPin, DollarSign, Star, ArrowRight, Plus, Loader, Wallet, History } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getUserRides } from '../../services/rideService'
import { updateUserProfile } from '../../services/authService'
import { formatDate, STATUS_COLORS, STATUS_LABELS, VEHICLE_ICONS } from '../../utils/helpers'

function EmptyRides() {
  const navigate = useNavigate()
  return (
    <div className="text-center py-14">
      <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Car size={26} className="text-ink-300" />
      </div>
      <p className="font-display font-bold text-ink-700 mb-1">No rides yet</p>
      <p className="text-sm text-ink-400 mb-5">Book your first ride to get started</p>
      <button onClick={() => navigate('/book')} className="btn-primary text-sm px-5 py-2.5">
        <Car size={14} /> Book a Ride
      </button>
    </div>
  )
}

function RideRow({ ride }) {
  const icon = VEHICLE_ICONS[ride.vehicle] || '🚗'
  return (
    <div className="flex items-center gap-3 p-3.5 bg-ink-50 rounded-2xl hover:bg-brand-50/30 transition-colors group">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0 border border-ink-100">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-800 truncate">{ride.pickup} → {ride.destination}</p>
        <p className="text-xs text-ink-400 mt-0.5">{formatDate(ride.createdAt)}</p>
      </div>
      <div className="text-right shrink-0">
        {ride.fare && <p className="font-bold text-ink-900 text-sm">₹{ride.fare}</p>}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[ride.status] || 'bg-ink-100 text-ink-500'}`}>
          {STATUS_LABELS[ride.status] || ride.status}
        </span>
      </div>
    </div>
  )
}

export default function UserDashboard({ initialTab = 'overview' }) {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const navigate   = useNavigate()
  const [tab, setTab]           = useState(initialTab)
  const [rides, setRides]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Saved places
  const [addingPlace, setAddingPlace]   = useState(false)
  const [newPlace, setNewPlace]         = useState({ label: '', address: '' })
  const [savingPlace, setSavingPlace]   = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true); setError(null)
    getUserRides(user.uid)
      .then(r => { setRides(r); setLoading(false) })
      .catch(() => { setError('Failed to load rides'); setLoading(false) })
  }, [user])

  const completed = rides.filter(r => r.status === 'completed')
  const totalSpent = completed.reduce((s, r) => s + (Number(r.fare) || 0), 0)

  const handleSavePlace = async () => {
    if (!newPlace.label.trim() || !newPlace.address.trim()) { toast('Fill label and address', 'warning'); return }
    setSavingPlace(true)
    try {
      const existing = profile?.savedLocations || []
      await updateUserProfile(user.uid, { savedLocations: [...existing, { ...newPlace, id: Date.now().toString() }] })
      await refreshProfile()
      setNewPlace({ label: '', address: '' }); setAddingPlace(false)
      toast('Location saved!', 'success')
    } catch { toast('Failed to save', 'error') }
    setSavingPlace(false)
  }

  const handleRemovePlace = async (id) => {
    try {
      await updateUserProfile(user.uid, { savedLocations: (profile?.savedLocations || []).filter(l => l.id !== id) })
      await refreshProfile(); toast('Removed', 'info')
    } catch { toast('Failed', 'error') }
  }

  const TABS = [
    { id: 'overview', label: 'Overview',     icon: null    },
    { id: 'history',  label: 'Ride History', icon: History  },
    { id: 'payments', label: 'Payments',     icon: Wallet   },
    { id: 'places',   label: 'Saved Places', icon: MapPin   },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-brand-500 via-brand-500 to-orange-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-premium">
        <div aria-hidden className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
        <div aria-hidden className="absolute -bottom-8 right-12 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-brand-100 text-sm mb-0.5">Welcome back,</p>
          <h2 className="font-display font-bold text-2xl mb-4">{profile?.name?.split(' ')[0] || 'Rider'} 👋</h2>
          <button onClick={() => navigate('/book')}
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold text-sm px-5 py-2.5 rounded-2xl hover:bg-brand-50 transition-colors shadow-sm">
            <Car size={15} /> Book a Ride <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? [1,2,3,4].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)
          : [
              { label: 'Total Rides',  value: completed.length,              icon: Car,        color: 'bg-blue-50 text-blue-600'     },
              { label: 'Amount Spent', value: `₹${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Avg Rating',   value: '4.9',                         icon: Star,       color: 'bg-amber-50 text-amber-600'   },
              { label: 'Shared Rides', value: rides.filter(r=>r.isShared).length, icon: MapPin, color: 'bg-violet-50 text-violet-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="kpi-card">
                <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={16} /></div>
                <p className="font-display font-bold text-xl text-ink-900">{value}</p>
                <p className="text-xs text-ink-400 mt-0.5">{label}</p>
              </div>
            ))
        }
      </div>

      {/* Tab card */}
      <div className="bg-white rounded-3xl shadow-card border border-ink-100/60 overflow-hidden">
        <div className="flex border-b border-ink-100 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-max py-3.5 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/20' : 'text-ink-500 hover:text-ink-800'
              }`}>{t.label}</button>
          ))}
        </div>
        <div className="p-5">

          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-ink-800 text-sm">Recent Activity</h3>
                {rides.length > 0 && <button onClick={() => setTab('history')} className="text-xs text-brand-500 font-semibold hover:text-brand-700">View all →</button>}
              </div>
              {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 shimmer rounded-2xl"/>)}</div>
              : error ? <p className="text-sm text-red-500 py-4 text-center">{error}</p>
              : rides.length === 0 ? <EmptyRides />
              : <div className="space-y-2">{rides.slice(0,5).map(r=><RideRow key={r.id} ride={r}/>)}</div>}
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div>
              <h3 className="font-display font-semibold text-ink-800 text-sm mb-3">All Rides ({rides.length})</h3>
              {loading ? <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-16 shimmer rounded-2xl"/>)}</div>
              : error ? <p className="text-sm text-red-500 py-4 text-center">{error}</p>
              : rides.length === 0 ? <EmptyRides />
              : <div className="space-y-2">{rides.map(r=><RideRow key={r.id} ride={r}/>)}</div>}
            </div>
          )}

          {/* Payments */}
          {tab === 'payments' && (
            <div>
              <div className="bg-gradient-to-br from-ink-900 to-ink-700 rounded-2xl p-5 text-white mb-5">
                <div className="flex items-center gap-2 mb-1"><Wallet size={16} className="text-brand-400" /><span className="text-sm text-ink-300">Total Spent</span></div>
                <p className="font-display font-bold text-3xl">₹{totalSpent.toLocaleString()}</p>
                <p className="text-ink-400 text-xs mt-1">{completed.length} completed rides</p>
              </div>
              {loading ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 shimmer rounded-2xl"/>)}</div>
              : error ? <p className="text-sm text-red-500 py-4 text-center">{error}</p>
              : rides.filter(r=>r.fare).length === 0
                ? <div className="text-center py-10 text-ink-400"><DollarSign size={32} className="mx-auto mb-2 opacity-30"/><p className="text-sm font-medium">No transactions yet</p><p className="text-xs mt-1">Complete a ride to see payment history</p></div>
                : <div className="space-y-2">{rides.filter(r=>r.fare).map(ride=>(
                    <div key={ride.id} className="flex items-center justify-between p-3.5 bg-ink-50 rounded-2xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{VEHICLE_ICONS[ride.vehicle]||'🚗'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-800 truncate">{ride.pickup} → {ride.destination}</p>
                          <p className="text-xs text-ink-400">{formatDate(ride.createdAt)}</p>
                        </div>
                      </div>
                      <p className="font-bold text-ink-900 shrink-0 ml-3">₹{ride.fare}</p>
                    </div>
                  ))}</div>
              }
            </div>
          )}

          {/* Saved Places */}
          {tab === 'places' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink-800 text-sm">Saved Places</h3>
                <button onClick={() => setAddingPlace(!addingPlace)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-700 transition-colors">
                  <Plus size={13} /> Add Place
                </button>
              </div>

              {addingPlace && (
                <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-4 space-y-3">
                  <input value={newPlace.label} onChange={e=>setNewPlace(p=>({...p,label:e.target.value}))} placeholder="Label (Home, Office…)" className="input-field text-sm" />
                  <input value={newPlace.address} onChange={e=>setNewPlace(p=>({...p,address:e.target.value}))} placeholder="Full address" className="input-field text-sm" />
                  <div className="flex gap-2">
                    <button onClick={()=>setAddingPlace(false)} className="btn-secondary text-xs py-2 flex-1">Cancel</button>
                    <button onClick={handleSavePlace} disabled={savingPlace} className="btn-primary text-xs py-2 flex-1 flex items-center justify-center gap-1.5">
                      {savingPlace&&<Loader size={11} className="animate-spin"/>} Save
                    </button>
                  </div>
                </div>
              )}

              {(!profile?.savedLocations || profile.savedLocations.length === 0) && !addingPlace
                ? <div className="text-center py-10">
                    <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><MapPin size={22} className="text-ink-300"/></div>
                    <p className="text-sm font-semibold text-ink-600 mb-1">No saved places</p>
                    <p className="text-xs text-ink-400">Save home, office &amp; frequent spots for quick booking</p>
                    <button onClick={()=>setAddingPlace(true)} className="btn-secondary text-xs mt-4 inline-flex items-center gap-1.5"><Plus size={12}/> Add first place</button>
                  </div>
                : <div className="space-y-2">
                    {(profile?.savedLocations||[]).map(loc=>(
                      <div key={loc.id} className="flex items-center gap-3 p-3.5 bg-ink-50 rounded-2xl group hover:bg-brand-50/40 transition-colors">
                        <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center shrink-0"><MapPin size={14} className="text-brand-500"/></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink-800">{loc.label}</p>
                          <p className="text-xs text-ink-400 truncate">{loc.address}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>navigate('/book',{state:{pickup:loc.address}})} className="text-xs text-brand-500 font-semibold hover:text-brand-700">Book →</button>
                          <button onClick={()=>handleRemovePlace(loc.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
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
