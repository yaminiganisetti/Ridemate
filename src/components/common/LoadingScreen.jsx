import { Car } from 'lucide-react'
export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
        <Car size={20} className="text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  )
}
