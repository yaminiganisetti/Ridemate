import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight, Shield, Clock, Star, Navigation } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getPlatformStats } from '../../services/rideService'

const fmt = (n) => {
  if (n == null || n === 0) return null
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`
  if (n >= 1000) return `${Math.round(n / 100) / 10}K+`
  return `${n}+`
}

export default function HeroSection() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [pickup, setPickup]       = useState('')
  const [dest, setDest]           = useState('')
  const [stats, setStats]         = useState(null)

  useEffect(() => { getPlatformStats().then(s => setStats(s)).catch(() => {}) }, [])

  const handleBook = (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    navigate('/book', { state: { pickup, destination: dest } })
  }

  const displayStats = stats ? [
    fmt(stats.activeDrivers)  ? { label: 'Verified drivers',   value: fmt(stats.activeDrivers)  } : null,
    fmt(stats.totalUsers)     ? { label: 'Riders served',      value: fmt(stats.totalUsers)     } : null,
    fmt(stats.completedRides) ? { label: 'Rides completed',    value: fmt(stats.completedRides) } : null,
  ].filter(Boolean) : []

  return (
    <section className="pt-14 min-h-[90vh] flex items-center bg-white dark:bg-slate-950">
      <div className="container-wide py-16 md:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100 mb-6 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              Available now in your city
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
              Move smarter.<br />
              <span className="text-gradient">Ride better.</span>
            </h1>

            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-md">
              Your everyday ride, made simple. Book bikes, autos and cars in seconds with verified drivers and real-time tracking.
            </p>

            {/* Booking form */}
            <form onSubmit={handleBook} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md p-4 mb-8 max-w-md">
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-600 rounded-full" />
                  <input value={pickup} onChange={e => setPickup(e.target.value)}
                    className="input pl-8" placeholder="Pickup location" />
                </div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none" />
                  <input value={dest} onChange={e => setDest(e.target.value)}
                    className="input pl-8" placeholder="Where are you going?" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full">
                Find a Ride <ArrowRight size={16} />
              </button>
            </form>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Shield, text: 'Verified drivers' },
                { icon: Navigation, text: 'Real-time tracking' },
                { icon: Star, text: 'Rated 4.8 / 5' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                  <Icon size={14} className="text-primary-500 shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — visual */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="relative">
              {/* Main card */}
              <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                      <Navigation size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Live tracking active</p>
                      <p className="text-slate-400 text-xs">Driver 2.4 km away</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-400">Live</span>
                    </div>
                  </div>

                  {/* Vehicle options preview */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      { icon: '🏍️', label: 'Bike',  price: '₹50+',  active: false },
                      { icon: '🛺', label: 'Auto',  price: '₹80+',  active: true  },
                      { icon: '🚗', label: 'Car',   price: '₹150+', active: false },
                    ].map(({ icon, label, price, active }) => (
                      <div key={label}
                        className={`rounded-xl p-3 text-center border transition-all ${
                          active
                            ? 'bg-primary-600 border-primary-500'
                            : 'bg-slate-800 border-slate-700 dark:bg-slate-700/50'
                        }`}>
                        <div className="text-2xl mb-1">{icon}</div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className={`text-xs mt-0.5 ${active ? 'text-primary-200' : 'text-slate-400'}`}>{price}</p>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  {displayStats.length > 0 ? (
                    <div className={`grid gap-3 ${displayStats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {displayStats.map(({ label, value }) => (
                        <div key={label} className="bg-slate-800/60 dark:bg-slate-700/40 rounded-xl p-3 text-center">
                          <p className="text-xl font-bold">{value}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Cities covered',  value: 'Growing' },
                        { label: 'Drivers online',  value: 'Real-time' },
                        { label: 'Support',         value: '24 / 7' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                          <p className="text-sm font-semibold">{value}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Floating chips */}
              <div className="absolute -left-5 top-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🛺</span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto nearby</p>
                  <p className="text-xs text-green-600">2 min away</p>
                </div>
              </div>
              <div className="absolute -right-5 bottom-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Top rated</p>
                  <p className="text-xs text-slate-500">4.9 rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
