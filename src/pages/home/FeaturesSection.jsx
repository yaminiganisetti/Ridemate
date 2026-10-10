import { Shield, Clock, CreditCard, MapPin, Users, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Zap,        bg: 'bg-amber-50  text-amber-600',   title: 'Instant booking',      desc: 'Book in under 30 seconds. Real-time driver matching with live GPS tracking.' },
  { icon: Shield,     bg: 'bg-green-50  text-green-600',   title: 'Safe & verified',       desc: 'Every driver is background-checked, licensed, and rated by real riders.' },
  { icon: CreditCard, bg: 'bg-blue-50   text-blue-600',    title: 'Flexible payments',    desc: 'Pay via UPI, PhonePe, GPay, Paytm, Razorpay, or cash — your choice.' },
  { icon: Users,      bg: 'bg-violet-50 text-violet-600',  title: 'Shared rides',         desc: 'Share autos and cars with others heading your way. Split fares, save more.' },
  { icon: MapPin,     bg: 'bg-rose-50   text-rose-600',    title: 'Live tracking',         desc: 'Watch your ride in real-time. Share your trip with family for safety.' },
  { icon: Clock,      bg: 'bg-cyan-50   text-cyan-600',    title: 'On-time pickups',       desc: 'Our drivers know your city. Expect punctual, reliable service every time.' },
]

export default function FeaturesSection() {
  return (
    <section className="section bg-white dark:bg-slate-900">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">Why RideMate</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Built for real riders
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto">
            Everything you need for a safe, fast and affordable ride — every time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, bg, title, desc }) => (
            <div key={title} className="card p-5 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${bg}`}>
                <Icon size={17} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
