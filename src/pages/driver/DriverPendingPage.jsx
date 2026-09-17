import { Link } from 'react-router-dom'
import { Clock, CheckCircle, Phone, Mail } from 'lucide-react'

const STEPS = [
  { label: 'Application submitted', done: true,  icon: CheckCircle },
  { label: 'Document verification',  done: false, icon: Clock        },
  { label: 'Background check',       done: false, icon: Clock        },
  { label: 'Account approved',       done: false, icon: Clock        },
]

export default function DriverPendingPage() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-ink-100/60 p-8 text-center mb-5">
          <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Clock size={32} className="text-amber-500 animate-pulse-slow" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink-900 mb-2">
            Application Under Review
          </h1>
          <p className="text-ink-400 text-sm leading-relaxed mb-7">
            Your driver application is being reviewed by our team. This usually takes 24–48 hours. We'll notify you once approved.
          </p>

          {/* Progress steps */}
          <div className="text-left space-y-3 mb-7">
            {STEPS.map(({ label, done, icon: Icon }, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${done ? 'bg-emerald-50 border border-emerald-200/60' : 'bg-ink-50 border border-ink-100'}`}>
                <Icon size={17} className={done ? 'text-emerald-500' : 'text-ink-300'} />
                <span className={`text-sm font-medium ${done ? 'text-emerald-700' : 'text-ink-400'}`}>{label}</span>
                {done && <span className="ml-auto text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">Done</span>}
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="bg-ink-50 rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold text-ink-700 mb-2">Need help?</p>
            <div className="space-y-1.5">
              <a href="mailto:support@ridemate.in" className="flex items-center gap-2 text-xs text-ink-500 hover:text-brand-500 transition-colors">
                <Mail size={12} /> support@ridemate.in
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-2 text-xs text-ink-500 hover:text-brand-500 transition-colors">
                <Phone size={12} /> +91 99999 99999
              </a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-ink-400 hover:text-ink-700 transition-colors font-medium">
            ← Return to home
          </Link>
        </div>
      </div>
    </div>
  )
}
