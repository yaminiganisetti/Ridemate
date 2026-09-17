import { X, MapPin, Navigation } from 'lucide-react'

export default function RideTrackerModal({ rideId, driver, onClose }) {
  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-display font-bold text-lg text-ink-900">Track Ride</h2>
          <button onClick={onClose}><X size={20} className="text-ink-400 hover:text-ink-700" /></button>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 h-64 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
          <div className="text-center relative z-10">
            <div className="text-4xl animate-bounce mb-2">🚗</div>
            <p className="text-sm font-semibold text-ink-700">Driver is on the way</p>
            <p className="text-xs text-ink-400 mt-1">ETA: ~4 minutes</p>
          </div>
        </div>
        <div className="p-5">
          {driver && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-xl">{driver.avatar}</div>
              <div>
                <p className="font-semibold text-ink-900 text-sm">{driver.name}</p>
                <p className="text-xs text-ink-400">{driver.vehicle}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <div className="flex items-center gap-1 text-xs text-ink-500">
                  <Navigation size={12} className="text-emerald-500" />
                  <span className="font-medium text-emerald-600">Online</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
