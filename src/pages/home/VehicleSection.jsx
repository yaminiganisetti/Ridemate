import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, Zap, Shield } from 'lucide-react'

const VEHICLES = [
  {
    type: 'bike',
    icon: '🏍️',
    name: 'Bike',
    tagline: 'Quickest way through traffic',
    capacity: '1 passenger',
    price: 'From ₹50',
    features: ['Fastest pickup', 'Solo travel', 'Low cost'],
    Icon: Zap,
    bgClass: 'bg-bike-bg border-bike-border',
    textClass: 'text-bike-text',
    iconClass: 'text-bike-icon',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
  {
    type: 'auto',
    icon: '🛺',
    name: 'Auto',
    tagline: 'Comfortable city commute',
    capacity: '3 passengers',
    price: 'From ₹80',
    features: ['Share & save', 'Covered ride', 'City-wide'],
    Icon: Users,
    bgClass: 'bg-auto-bg border-auto-border',
    textClass: 'text-auto-text',
    iconClass: 'text-auto-icon',
    btnClass: 'bg-primary-600 hover:bg-primary-700 text-white',
    featured: true,
  },
  {
    type: 'car',
    icon: '🚗',
    name: 'Car',
    tagline: 'Premium travel, any occasion',
    capacity: '4 passengers',
    price: 'From ₹150',
    features: ['AC cabin', 'Family rides', 'Airport drops'],
    Icon: Shield,
    bgClass: 'bg-car-bg border-car-border',
    textClass: 'text-car-text',
    iconClass: 'text-car-icon',
    btnClass: 'bg-green-600 hover:bg-green-600-text text-white',
  },
]

export default function VehicleSection() {
  const navigate = useNavigate()

  return (
    <section className="section bg-slate-50 dark:bg-slate-950">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2 dark:text-primary-400">Our Fleet</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Choose your ride
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto">
            From quick solo trips to comfortable family journeys — we have the right vehicle for every occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {VEHICLES.map(({ type, icon, name, tagline, capacity, price, features, Icon, bgClass, textClass, iconClass, btnClass, featured }) => (
            <div key={type}
              className={`relative card p-6 border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${bgClass} ${featured ? 'ring-2 ring-primary-600 ring-offset-2' : ''}`}
              onClick={() => navigate(`/book?vehicle=${type}`)}>

              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div className="flex items-start justify-between mb-5">
                <div className="text-4xl">{icon}</div>
                <Icon size={16} className={`mt-1 ${iconClass}`} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{tagline}</p>

              <div className="space-y-2 mb-5">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${iconClass.replace('text-', 'bg-')}`} />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/70 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{capacity}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{price}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/book?vehicle=${type}`) }}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${btnClass}`}>
                  Book now <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
