import { useState } from 'react'
import { Users, Clock, MapPin, ArrowRight, CheckCircle, Loader } from 'lucide-react'
import { joinSharedRide } from '../../services/rideService'
import { VEHICLE_ICONS } from '../../utils/helpers'

export default function SharedRideList({ rides, vehicle, userId }) {
  const [joining, setJoining] = useState(null)
  const [joined, setJoined] = useState([])

  const handleJoin = async (rideId) => {
    if (!userId) return
    setJoining(rideId)
    try {
      await joinSharedRide(rideId, { userId, joinedAt: new Date().toISOString() })
      setJoined(j => [...j, rideId])
    } catch (e) {
      alert(e.message || 'Could not join ride')
    }
    setJoining(null)
  }

  if (!rides.length) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{VEHICLE_ICONS[vehicle] || '🚗'}</div>
        <p className="font-semibold text-ink-700 mb-1">No shared rides available</p>
        <p className="text-ink-400 text-sm">Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
        <Users size={18} className="text-brand-500" />
        Available Shared Rides
        <span className="ml-auto text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium">
          {rides.length} available
        </span>
      </h3>
      <div className="space-y-3">
        {rides.map((ride) => {
          const seatsLeft = (ride.maxPassengers || 3) - (ride.passengers?.length || 0)
          const alreadyJoined = joined.includes(ride.id) || ride.passengers?.some(p => p.userId === userId)
          return (
            <div key={ride.id}
              className="border border-ink-100 rounded-2xl p-4 hover:border-brand-300 hover:bg-brand-50/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{VEHICLE_ICONS[ride.vehicleType] || '🚗'}</span>
                    <span className="text-xs font-semibold text-ink-600 capitalize">{ride.vehicleType}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seatsLeft > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft > 1 ? 's' : ''} left` : 'Full'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-ink-700 mb-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                    <span className="truncate">{ride.pickup || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-ink-700">
                    <MapPin size={11} className="text-brand-500 shrink-0" />
                    <span className="truncate">{ride.destination || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {ride.departureTime && (
                      <span className="flex items-center gap-1 text-xs text-ink-400">
                        <Clock size={11} /> {ride.departureTime}
                      </span>
                    )}
                    <span className="text-xs font-bold text-brand-600">
                      ₹{ride.farePerPerson || '—'}/person
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {alreadyJoined ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <CheckCircle size={14} /> Joined
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(ride.id)}
                      disabled={!!joining || seatsLeft <= 0}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-50">
                      {joining === ride.id
                        ? <Loader size={12} className="animate-spin" />
                        : <><ArrowRight size={12} /> Join</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
