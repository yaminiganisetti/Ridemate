import { Car } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading RideMate…' }) {
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-premium">
            <Car size={26} className="text-white" />
          </div>
          <div className="absolute -inset-1 bg-brand-400/20 rounded-3xl animate-ping" />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-xl text-ink-900">Ride<span className="text-brand-500">Mate</span></p>
          <p className="text-ink-400 text-sm mt-1">{message}</p>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i=>(
            <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
          ))}
        </div>
      </div>
    </div>
  )
}
