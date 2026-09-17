import { Shield, Clock, CreditCard, MapPin, Users, Star } from 'lucide-react'
import useReveal from '../../hooks/useReveal'

const FEATURES = [
  { icon: Zap,        color: 'bg-amber-100 text-amber-600',   title: 'Instant Booking',     desc: 'Book in under 30 seconds. Real-time driver matching with live GPS tracking.' },
  { icon: Shield,     color: 'bg-emerald-100 text-emerald-600', title: 'Safe & Verified',     desc: 'Every driver is background-checked, licensed, and rated by real riders.' },
  { icon: CreditCard, color: 'bg-blue-100 text-blue-600',     title: 'Flexible Payments',   desc: 'Pay via UPI, PhonePe, GPay, Paytm, Razorpay, or cash — your choice.' },
  { icon: Users,      color: 'bg-violet-100 text-violet-600', title: 'Shared Rides',        desc: 'Share autos and cars with others heading your way. Split fares, save more.' },
  { icon: MapPin,     color: 'bg-rose-100 text-rose-600',     title: 'Live Tracking',       desc: 'Watch your ride in real-time. Share your trip with family for safety.' },
  { icon: Star,       color: 'bg-orange-100 text-orange-600', title: 'Rated 4.8 / 5',       desc: 'Consistently rated India\'s best local ride platform by real riders.' },
]

// Zap needs to be imported
import { Zap } from 'lucide-react'

export default function FeaturesSection() {
  const ref = useReveal([])

  return (
    <section ref={ref} className="py-24 bg-ink-50 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal">
          <p className="section-label mb-3">Why RideMate</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ink-900">
            Built for <span className="text-gradient-brand">real riders</span>
          </h2>
          <p className="text-ink-400 text-lg mt-3 max-w-xl mx-auto">
            Everything you need for a safe, fast, and affordable ride — every single time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <div key={title}
              className={`reveal reveal-delay-${(i % 3) + 1} card group cursor-default`}>
              <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={19} />
              </div>
              <h3 className="font-display font-bold text-lg text-ink-900 mb-2">{title}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
