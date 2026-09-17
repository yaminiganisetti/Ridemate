import { useState, useEffect } from 'react'
import { Users, DollarSign, MapPin, ArrowRight, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { VEHICLE_ICONS } from '../../utils/helpers'

export default function SharedRideSection() {
  const navigate = useNavigate()
  const [liveRides, setLiveRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'sharedRides'), where('status', '==', 'open'), limit(3))
    const unsub = onSnapshot(q, snap => {
      setLiveRides(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Live shared rides panel */}
          <div className="relative">
            <div className="bg-ink-50 rounded-3xl p-8">
              <h4 className="font-display font-semibold text-ink-700 mb-4 text-sm flex items-center gap-2">
                Live Shared Rides
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </h4>
              {loading ? (
                <div className="flex items-center gap-2 text-ink-400 text-sm py-4">
                  <Loader size={14} className="animate-spin" /> Loading live rides…
                </div>
              ) : liveRides.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-ink-100">
                  <p className="text-ink-500 text-sm font-medium">No shared rides right now</p>
                  <p className="text-ink-400 text-xs mt-1">Be the first to create one!</p>
                  <button onClick={() => navigate('/book')} className="btn-primary text-xs mt-3 px-4 py-2">
                    Create Shared Ride
                  </button>
                </div>
              ) : liveRides.map(r => {
                const seats = (r.maxPassengers || 3) - (r.passengers?.length || 0)
                return (
                  <div key={r.id} className="bg-white rounded-2xl p-4 mb-3 flex items-center justify-between shadow-sm border border-ink-100/60 hover:shadow-card transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{VEHICLE_ICONS[r.vehicleType] || '🚗'}</span>
                      <div>
                        <p className="text-sm font-semibold text-ink-800 truncate max-w-[180px]">{r.pickup} → {r.destination}</p>
                        <p className="text-xs text-ink-400 mt-0.5 capitalize">{r.vehicleType} · {seats} seat{seats !== 1 ? 's' : ''} left</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brand-500">{r.farePerPerson ? `₹${r.farePerPerson}/person` : '—'}</p>
                      <button onClick={() => navigate('/book')} className="text-xs text-ink-500 hover:text-brand-500 mt-1">Join →</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="section-label mb-3">Shared Rides</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink-900 mb-5">
              Travel together,<br />spend less
            </h2>
            <p className="text-ink-500 leading-relaxed mb-8">
              Our innovative shared ride system matches you with co-passengers heading the same way.
              Split the fare, reduce traffic, and make commuting social — available for autos and cars.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: DollarSign, title: 'Save up to 50%', desc: 'Fare is automatically split between all passengers' },
                { icon: Users, title: 'Travel with trust', desc: 'All co-passengers are verified RideMate users' },
                { icon: MapPin, title: 'Smart matching', desc: 'Route-based matching finds rides close to your path' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 text-sm">{title}</h4>
                    <p className="text-ink-400 text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/book')} className="btn-primary flex items-center gap-2">
              Try Shared Ride <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
