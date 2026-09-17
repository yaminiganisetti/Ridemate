import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Users, Crown } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

const VEHICLES = [
  {
    type: 'bike',
    icon: '🏍️',
    name: 'Bike',
    tagline: 'Speed through the city',
    price: '₹50+',
    badge: 'Fastest',
    badgeBg: 'bg-amber-500',
    Icon: Zap,
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    cardBg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200/70',
    textAccent: 'text-amber-700',
    btnGrad: 'from-amber-400 to-orange-500',
    glow: 'hover:shadow-[0_8px_32px_rgba(251,191,36,0.35)]',
    iconBg: 'bg-amber-100',
    features: ['Beat traffic instantly', 'Solo travel', 'Eco-friendly rides'],
  },
  {
    type: 'auto',
    icon: '🛺',
    name: 'Auto',
    tagline: 'City comfort & savings',
    price: '₹80+',
    badge: 'Popular',
    badgeBg: 'bg-blue-500',
    Icon: Users,
    gradient: 'from-blue-400 via-sky-400 to-cyan-400',
    cardBg: 'from-blue-50 to-sky-50',
    border: 'border-blue-200/70',
    textAccent: 'text-blue-700',
    btnGrad: 'from-blue-500 to-sky-500',
    glow: 'hover:shadow-[0_8px_32px_rgba(96,165,250,0.35)]',
    iconBg: 'bg-blue-100',
    features: ['Share & split fare', 'Covered seating', 'City-wide coverage'],
  },
  {
    type: 'car',
    icon: '🚗',
    name: 'Car',
    tagline: 'Premium travel experience',
    price: '₹150+',
    badge: 'Premium',
    badgeBg: 'bg-emerald-600',
    Icon: Crown,
    gradient: 'from-emerald-400 via-teal-400 to-green-500',
    cardBg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200/70',
    textAccent: 'text-emerald-700',
    btnGrad: 'from-emerald-500 to-teal-500',
    glow: 'hover:shadow-[0_8px_32px_rgba(52,211,153,0.35)]',
    iconBg: 'bg-emerald-100',
    features: ['Air-conditioned', 'Family-friendly', 'Airport drops'],
  },
]

export default function VehicleSection() {
  const navigate = useNavigate()
  const ref = useReveal([])

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* subtle bg grid */}
      <div aria-hidden className="absolute inset-0 line-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal">
          <p className="section-label mb-3">Our Fleet</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ink-900">
            Choose your <span className="text-gradient-brand">ride</span>
          </h2>
          <p className="text-ink-400 text-lg mt-3 max-w-xl mx-auto">
            From quick bike runs to premium car rides — RideMate has a vehicle for every moment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {VEHICLES.map(({ type, icon, name, tagline, price, badge, badgeBg, Icon, gradient, cardBg, border, textAccent, btnGrad, glow, iconBg, features }, i) => (
            <div
              key={type}
              className={`reveal reveal-delay-${i + 1} group relative bg-gradient-to-br ${cardBg} rounded-3xl border ${border} p-7 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 ${glow}`}
              onClick={() => navigate(`/book?vehicle=${type}`)}
            >
              {/* Gradient orb */}
              <div aria-hidden className={`absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

              {/* Badge */}
              <span className={`absolute top-5 right-5 ${badgeBg} text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide`}>
                {badge}
              </span>

              {/* Icon + accent */}
              <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {icon}
              </div>

              {/* Decorative accent icon */}
              <div className={`absolute bottom-24 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
                <Icon size={60} className={textAccent} />
              </div>

              <h3 className="font-display font-bold text-2xl text-ink-900 mb-1">{name}</h3>
              <p className="text-ink-500 text-sm mb-5">{tagline}</p>

              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-ink-600 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient} shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xs text-ink-400 font-medium">Starting from</p>
                  <p className="font-display font-bold text-2xl text-ink-900">{price}</p>
                </div>
                <button
                  className={`flex items-center gap-1.5 bg-gradient-to-r ${btnGrad} text-white text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm group-hover:gap-2.5 transition-all duration-200`}
                  onClick={e => { e.stopPropagation(); navigate(`/book?vehicle=${type}`) }}>
                  Book now
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
