import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, MapPin } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="blob w-96 h-96 bg-brand-200/25 animate-blob top-[-80px] left-[-60px]" />
        <div className="blob w-72 h-72 bg-blue-200/20 animate-blob bottom-[-60px] right-[-40px]" style={{animationDelay:'4s'}}/>
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>
      <div className="relative text-center max-w-md">
        <div className="text-7xl mb-4 animate-float inline-block">🗺️</div>
        <h1 className="font-display font-bold text-4xl text-ink-900 mb-3">Lost your way?</h1>
        <p className="text-ink-400 text-base mb-8 leading-relaxed">
          This road doesn't exist. Let's get you back on track — your destination is just a click away.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 px-5 py-3">
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2 px-5 py-3">
            <Car size={15} /> Home
          </Link>
        </div>
        <p className="text-xs text-ink-300 mt-8 font-mono">404 — Page not found</p>
      </div>
    </div>
  )
}
