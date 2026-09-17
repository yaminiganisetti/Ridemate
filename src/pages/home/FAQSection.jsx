import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'How do I book a ride?', a: 'Simply enter your pickup and destination, choose your vehicle type (bike, auto, or car), and tap "Find Rides". A nearby driver will be matched to you within minutes.' },
  { q: 'What is a shared ride?', a: 'Shared rides let you split the fare with co-passengers heading in the same direction. Available for autos and cars, shared rides can save you up to 50% compared to a solo ride.' },
  { q: 'How are drivers verified?', a: 'All drivers go through our admin approval process. We verify their identity, driving license, vehicle registration, and conduct background checks before they can accept rides.' },
  { q: 'What payment methods are accepted?', a: 'We support PhonePe, Google Pay, Paytm, and card payments via Razorpay. Cash payments are also accepted on select rides.' },
  { q: 'Can I schedule a ride in advance?', a: 'Yes! You can schedule rides up to 24 hours in advance. Just toggle "Schedule for later" on the booking page and pick your preferred time.' },
]

export default function FAQSection() {
  const [open, setOpen] = useState(null)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-3">FAQ</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink-900">Got questions?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="bg-ink-50 rounded-2xl overflow-hidden border border-ink-100">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left">
                <span className="font-semibold text-ink-900 text-sm sm:text-base pr-4">{q}</span>
                <ChevronDown size={18} className={`text-ink-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-4">
                  <p className="text-ink-500 text-sm leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
