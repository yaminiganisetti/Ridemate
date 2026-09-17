import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, ArrowRight, Shield, Clock, Zap, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getPlatformStats } from '../../services/rideService'

const fmt = (n) => {
  if (n == null) return '—'
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function HeroSection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pickup, setPickup]           = useState('')
  const [destination, setDestination] = useState('')
  const [stats, setStats]             = useState({ activeDrivers: null, citiesServed: null, totalUsers: null, avgRating: null })
  const [mounted, setMounted]         = useState(false)

  useEffect(() => {
    setMounted(true)
    getPlatformStats().then(s => setStats(s)).catch(() => {})
  }, [])

  const handleBook = () => {
    if (!user) { navigate('/login'); return }
    navigate('/book', { state: { pickup, destination } })
  }

  return (
    <section className="relative overflow-hidden bg-ink-50 min-h-[92vh] flex items-center">
      {/* Animated background blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob w-[520px] h-[520px] bg-brand-400/20 animate-blob top-[-120px] left-[-80px]" />
        <div className="blob w-[400px] h-[400px] bg-blue-300/15 animate-blob top-[40%] right-[-60px]" style={{ animationDelay: '3s' }} />
        <div className="blob w-[300px] h-[300px] bg-emerald-300/15 animate-blob bottom-[-80px] left-[30%]" style={{ animationDelay: '6s' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* ── LEFT ── */}
          <div className={mounted ? 'animate-slide-up' : 'opacity-0'}>
            {/* Label */}
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 border border-brand-200/60 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Zap size={13} className="text-brand-500" />
              India's Smartest Ride Platform
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl text-ink-900 leading-[1.05] mb-5">
              Ride{' '}
              <span className="relative inline-block">
                <span className="text-gradient-brand">anywhere</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 10" fill="none" aria-hidden>
                  <path d="M2 8 C50 2 150 2 198 8" stroke="#f97316" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
                </svg>
              </span>
              ,<br />smarter.
            </h1>

            <p className="text-ink-500 text-lg leading-relaxed max-w-[420px] mb-8">
              Book bikes, autos &amp; cars in seconds. Share rides, split fares, and reach your destination safely every time.
            </p>

            {/* Booking form */}
            <div className="bg-white rounded-3xl shadow-card-hover border border-ink-100/60 p-5 mb-8 max-w-[460px]">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-widest mb-4 font-mono">Book now</p>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full pointer-events-none" />
                  <input
                    value={pickup} onChange={e => setPickup(e.target.value)}
                    placeholder="Where are you?" className="input-field pl-9 pr-4" />
                </div>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                  <input
                    value={destination} onChange={e => setDestination(e.target.value)}
                    placeholder="Where to?" className="input-field pl-9 pr-4" />
                </div>
              </div>
              <button onClick={handleBook}
                className="btn-primary w-full text-base py-3.5">
                Find Rides <ArrowRight size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Shield, label: 'Safe & verified drivers' },
                { icon: Clock,  label: 'On-time pickups' },
                { icon: Star,   label: 'Top-rated service' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-ink-500 text-sm font-medium">
                  <Icon size={14} className="text-brand-400" /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className={`relative hidden lg:flex justify-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}>

            {/* Central card */}
            <div className="relative z-10 bg-white rounded-3xl shadow-card-hover border border-ink-100/50 p-8 w-[340px]">
              <div className="text-center mb-7">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
                  <Navigation size={28} className="text-brand-500" />
                </div>
                <p className="font-display font-bold text-xl text-ink-900 mb-1">Live platform stats</p>
                <p className="text-ink-400 text-sm">Updated from Firestore</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Active Drivers',  value: fmt(stats.activeDrivers),  color: 'bg-amber-50 text-amber-700',   border: 'border-amber-200/60' },
                  { label: 'Happy Riders',    value: fmt(stats.totalUsers),     color: 'bg-blue-50 text-blue-700',     border: 'border-blue-200/60' },
                  { label: 'Rides Done',      value: fmt(stats.completedRides), color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200/60' },
                  { label: 'Avg Rating',      value: stats.avgRating ? `${stats.avgRating}★` : '—', color: 'bg-violet-50 text-violet-700', border: 'border-violet-200/60' },
                ].map(({ label, value, color, border }) => (
                  <div key={label} className={`${color} border ${border} rounded-2xl p-3.5 text-center`}>
                    <p className="font-display font-bold text-2xl">{value}</p>
                    <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -left-10 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2.5 border border-ink-100/60 animate-float">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-lg shrink-0">🏍️</div>
              <div>
                <p className="text-xs font-bold text-ink-800">Bike ride</p>
                <p className="text-xs text-emerald-600 font-semibold">From ₹50</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-8 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2.5 border border-ink-100/60 animate-float" style={{ animationDelay: '3s' }}>
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-lg shrink-0">🚗</div>
              <div>
                <p className="text-xs font-bold text-ink-800">Car ride</p>
                <p className="text-xs text-brand-600 font-semibold">AC comfort</p>
              </div>
            </div>
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2.5 border border-ink-100/60 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg shrink-0">🛺</div>
              <div>
                <p className="text-xs font-bold text-ink-800">Auto share</p>
                <p className="text-xs text-blue-600 font-semibold">Split fare</p>
              </div>
            </div>

            {/* Payment logos */}
            <div className="absolute -bottom-14 left-0 right-0 flex justify-center gap-5 opacity-50">
              {['PhonePe', 'GPay', 'Paytm', 'Razorpay'].map(p => (
                <span key={p} className="text-xs font-bold text-ink-600 font-mono">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
