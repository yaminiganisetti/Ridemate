import { useState, useEffect, useCallback } from 'react'
import { Users, Car, DollarSign, TrendingUp, Check, X, Eye, BarChart2, Star, RefreshCw, Loader, Shield, AlertTriangle } from 'lucide-react'
import { getPendingDrivers, getAllDrivers, updateDriverStatus } from '../../services/driverService'
import { getPendingRides } from '../../services/rideService'
import { formatDate, STATUS_COLORS, STATUS_LABELS, VEHICLE_ICONS } from '../../utils/helpers'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'drivers', label: 'Driver Approvals', icon: Shield },
  { id: 'rides', label: 'All Rides', icon: Car },
  { id: 'transactions', label: 'Transactions', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [pendingDrivers, setPendingDrivers] = useState([])
  const [allDrivers, setAllDrivers] = useState([])
  const [allRides, setAllRides] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pending, drivers] = await Promise.all([
        getPendingDrivers(),
        getAllDrivers(),
      ])
      setPendingDrivers(pending)
      setAllDrivers(drivers)

      // Load recent rides
      const ridesSnap = await getDocs(query(collection(db, 'rides'), orderBy('createdAt', 'desc'), limit(50)))
      setAllRides(ridesSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      // Load transactions
      const txSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50)))
      setAllTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e); setError('Failed to load data. Please refresh.') }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const refresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleDriverAction = async (driverId, action) => {
    setActionLoading(driverId + action)
    try {
      await updateDriverStatus(driverId, action)
      setPendingDrivers(p => p.filter(d => d.id !== driverId))
      setAllDrivers(d => d.map(dr => dr.id === driverId ? { ...dr, status: action } : dr))
    } catch (e) { console.error(e) }
    setActionLoading(null)
  }

  const approvedDrivers = allDrivers.filter(d => d.status === 'approved')
  const completedRides = allRides.filter(r => r.status === 'completed')
  const totalRevenue = allTransactions.filter(t => t.status === 'success').reduce((s, t) => s + (t.amount || 0), 0)
  const sharedRides = allRides.filter(r => r.isShared)

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Admin Dashboard</h1>
          <p className="text-ink-400 text-sm">Manage drivers, rides, and platform analytics</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 btn-secondary text-sm py-2">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drivers', value: approvedDrivers.length, icon: Users, color: 'bg-blue-100 text-blue-600', change: `${onlineDrivers.length} online now` },
          { label: 'Total Rides', value: allRides.length, icon: Car, color: 'bg-purple-100 text-purple-600', change: `${completedRides.length} completed` },
          { label: 'Platform Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', change: 'All time' },
          { label: 'Pending Approvals', value: pendingDrivers.length, icon: AlertTriangle, color: pendingDrivers.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-ink-100 text-ink-500', change: 'Needs review' },
        ].map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="kpi-card">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="font-display font-bold text-2xl text-ink-900">{value}</p>
            <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{change}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 mb-4">
          <span>⚠️</span> {error}
        </div>
      )}
      {/* Tabs */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        <div className="flex border-b border-ink-100 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 flex-1 min-w-max py-3.5 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/30' : 'text-ink-500 hover:text-ink-800'
              }`}>
              <Icon size={14} /> {label}
              {id === 'drivers' && pendingDrivers.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingDrivers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Recent Rides */}
                <div>
                  <h3 className="font-display font-semibold text-ink-800 mb-3 text-sm">Recent Rides</h3>
                  {loading ? (
                    <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 shimmer rounded-xl"/>)}</div>
                  ) : allRides.slice(0, 5).map(ride => (
                    <div key={ride.id} className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl mb-2">
                      <span className="text-lg">{VEHICLE_ICONS[ride.vehicle] || '🚗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ink-800 truncate">{ride.pickup} → {ride.destination}</p>
                        <p className="text-xs text-ink-400">{formatDate(ride.createdAt)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ride.status] || 'bg-ink-100 text-ink-500'}`}>
                        {STATUS_LABELS[ride.status] || ride.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Driver Status */}
                <div>
                  <h3 className="font-display font-semibold text-ink-800 mb-3 text-sm">Driver Status</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Approved', count: approvedDrivers.length, color: 'bg-emerald-100 text-emerald-700' },
                      { label: 'Pending Review', count: pendingDrivers.length, color: 'bg-amber-100 text-amber-700' },
                      { label: 'Rejected', count: allDrivers.filter(d => d.status === 'rejected').length, color: 'bg-red-100 text-red-600' },
                      { label: 'Currently Online', count: approvedDrivers.filter(d => d.isOnline).length, color: 'bg-blue-100 text-blue-700' },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                        <span className="text-sm text-ink-700">{label}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shared ride stats */}
              <div className="bg-gradient-to-r from-purple-50 to-brand-50 rounded-2xl p-5">
                <h3 className="font-display font-semibold text-ink-800 mb-4 text-sm flex items-center gap-2">
                  <Users size={15} className="text-purple-500" /> Shared Ride Analytics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Shared', value: sharedRides.length },
                    { label: 'Completed', value: sharedRides.filter(r => r.status === 'completed').length },
                    { label: 'Active', value: sharedRides.filter(r => ['searching','accepted','ongoing'].includes(r.status)).length },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-display font-bold text-2xl text-ink-900">{value}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Driver Approvals */}
          {tab === 'drivers' && (
            <div className="space-y-4">
              {/* Pending */}
              <div>
                <h3 className="font-display font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  Pending Applications
                  {pendingDrivers.length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      {pendingDrivers.length}
                    </span>
                  )}
                </h3>
                {loading ? (
                  <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-28 shimmer rounded-2xl"/>)}</div>
                ) : pendingDrivers.length === 0 ? (
                  <div className="text-center py-8 bg-ink-50 rounded-2xl">
                    <Shield size={28} className="mx-auto mb-2 text-ink-300" />
                    <p className="text-ink-500 text-sm font-medium">No pending applications</p>
                  </div>
                ) : (
                  pendingDrivers.map(driver => (
                    <DriverApprovalCard key={driver.id} driver={driver}
                      onApprove={() => handleDriverAction(driver.id, 'approved')}
                      onReject={() => handleDriverAction(driver.id, 'rejected')}
                      approving={actionLoading === driver.id + 'approved'}
                      rejecting={actionLoading === driver.id + 'rejected'}
                    />
                  ))
                )}
              </div>

              {/* All drivers */}
              <div>
                <h3 className="font-display font-semibold text-ink-900 mb-3 mt-6">All Drivers ({allDrivers.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-ink-400 border-b border-ink-100">
                        <th className="text-left py-2 pr-4">Driver</th>
                        <th className="text-left py-2 pr-4">Vehicle</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2 pr-4">Rating</th>
                        <th className="text-left py-2">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      {allDrivers.map(d => (
                        <tr key={d.id} className="hover:bg-ink-50/50">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium text-ink-800">{d.name}</p>
                              <p className="text-xs text-ink-400">{d.email}</p>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="mr-1">{VEHICLE_ICONS[d.vehicleType] || '🚗'}</span>
                            <span className="text-ink-600">{d.vehicleModel}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              d.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-brand-500">★</span> {d.rating?.toFixed(1) || '—'}
                          </td>
                          <td className="py-3 text-ink-400 text-xs">{formatDate(d.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All Rides */}
          {tab === 'rides' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink-900">All Rides ({allRides.length})</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-ink-100 text-ink-600 px-2 py-1 rounded-lg">
                    {completedRides.length} completed
                  </span>
                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg">
                    {sharedRides.length} shared
                  </span>
                </div>
              </div>
              {loading ? (
                <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-16 shimmer rounded-xl"/>)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-ink-400 border-b border-ink-100">
                        <th className="text-left py-2 pr-4">Route</th>
                        <th className="text-left py-2 pr-4">Vehicle</th>
                        <th className="text-left py-2 pr-4">Fare</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      {allRides.map(ride => (
                        <tr key={ride.id} className="hover:bg-ink-50/50">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-ink-800 truncate max-w-[200px]">
                              {ride.pickup} → {ride.destination}
                            </p>
                            {ride.isShared && <span className="text-xs text-purple-600 font-medium">Shared</span>}
                          </td>
                          <td className="py-3 pr-4">
                            <span>{VEHICLE_ICONS[ride.vehicle] || '🚗'}</span>
                            <span className="ml-1 text-ink-600 capitalize">{ride.vehicle}</span>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-ink-900">₹{ride.fare || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ride.status] || 'bg-ink-100 text-ink-500'}`}>
                              {STATUS_LABELS[ride.status] || ride.status}
                            </span>
                          </td>
                          <td className="py-3 text-ink-400 text-xs">{formatDate(ride.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transactions */}
          {tab === 'transactions' && (
            <div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white mb-5">
                <p className="text-emerald-100 text-sm mb-1">Total Platform Revenue</p>
                <p className="font-display font-bold text-4xl">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-emerald-200 text-sm mt-1">
                  {allTransactions.filter(t => t.status === 'success').length} successful transactions
                </p>
              </div>

              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 shimmer rounded-xl"/>)}</div>
              ) : allTransactions.length === 0 ? (
                <div className="text-center py-10 text-ink-400">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No transactions yet</p>
                  <p className="text-xs mt-1">Completed payments will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-ink-400 border-b border-ink-100">
                        <th className="text-left py-2 pr-4">Transaction ID</th>
                        <th className="text-left py-2 pr-4">Amount</th>
                        <th className="text-left py-2 pr-4">Method</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      {allTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-ink-50/50">
                          <td className="py-3 pr-4 font-mono text-xs text-ink-500">#{tx.id.slice(-8).toUpperCase()}</td>
                          <td className="py-3 pr-4 font-bold text-ink-900">₹{tx.amount}</td>
                          <td className="py-3 pr-4">
                            <span className="capitalize text-ink-600">{tx.method || '—'}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                              tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{tx.status}</span>
                          </td>
                          <td className="py-3 text-ink-400 text-xs">{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {tab === 'analytics' && (
            <div className="space-y-5">
              <h3 className="font-display font-semibold text-ink-900">Platform Analytics</h3>

              {/* Vehicle breakdown */}
              <div className="grid md:grid-cols-3 gap-4">
                {['bike', 'auto', 'car'].map(vtype => {
                  const count = allRides.filter(r => r.vehicle === vtype).length
                  const pct = allRides.length > 0 ? Math.round((count / allRides.length) * 100) : 0
                  return (
                    <div key={vtype} className="bg-ink-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{VEHICLE_ICONS[vtype]}</span>
                        <span className="font-semibold text-ink-800 capitalize">{vtype}</span>
                      </div>
                      <p className="font-display font-bold text-3xl text-ink-900">{count}</p>
                      <p className="text-xs text-ink-400 mt-1">{pct}% of all rides</p>
                      <div className="mt-3 bg-ink-200 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Payment methods */}
              <div className="bg-ink-50 rounded-2xl p-5">
                <h4 className="font-semibold text-ink-800 mb-4 text-sm">Payment Methods Used</h4>
                <div className="space-y-2">
                  {['phonepe', 'gpay', 'paytm', 'razorpay', 'cash'].map(method => {
                    const count = allTransactions.filter(t => t.method === method && t.status === 'success').length
                    const pct = allTransactions.length > 0 ? Math.round((count / allTransactions.length) * 100) : 0
                    const emojis = { phonepe: '💜', gpay: '🔵', paytm: '💙', razorpay: '💳', cash: '💵' }
                    return (
                      <div key={method} className="flex items-center gap-3">
                        <span className="text-base w-5">{emojis[method]}</span>
                        <span className="text-sm text-ink-700 capitalize w-20">{method}</span>
                        <div className="flex-1 bg-ink-200 rounded-full h-2">
                          <div className="bg-brand-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-ink-500 w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-ink-50 rounded-2xl p-5">
                <h4 className="font-semibold text-ink-800 mb-4 text-sm flex items-center gap-2">
                  <Star size={14} className="text-brand-400" /> Driver Rating Distribution
                </h4>
                {allDrivers.filter(d => d.rating > 0).length === 0 ? (
                  <p className="text-sm text-ink-400">No ratings yet</p>
                ) : (
                  <div className="space-y-2">
                    {[5,4,3,2,1].map(star => {
                      const count = allDrivers.filter(d => Math.round(d.rating) === star).length
                      const pct = allDrivers.length > 0 ? Math.round((count / allDrivers.length) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-ink-600 w-4">{star}★</span>
                          <div className="flex-1 bg-ink-200 rounded-full h-2">
                            <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-ink-500 w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DriverApprovalCard({ driver, onApprove, onReject, approving, rejecting }) {
  const [showLicense, setShowLicense] = useState(false)
  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
          {VEHICLE_ICONS[driver.vehicleType] || '🚗'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-ink-900">{driver.name}</p>
              <p className="text-xs text-ink-400">{driver.email} · {driver.phone}</p>
              <p className="text-xs text-ink-500 mt-1">
                <span className="capitalize">{driver.vehicleType}</span> · {driver.vehicleModel} · {driver.vehicleNumber}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">License: {driver.licenseNumber}</p>
            </div>
            <span className="text-xs text-ink-400 shrink-0">{formatDate(driver.createdAt)}</span>
          </div>

          {driver.licenseUrl && (
            <div className="mt-3">
              <button onClick={() => setShowLicense(!showLicense)}
                className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline">
                <Eye size={12} /> {showLicense ? 'Hide' : 'View'} License
              </button>
              {showLicense && (
                <img src={driver.licenseUrl} alt="License" className="mt-2 max-h-32 rounded-xl object-cover border border-ink-200" />
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={onReject} disabled={rejecting || approving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
              {rejecting ? <Loader size={12} className="animate-spin" /> : <X size={12} />} Reject
            </button>
            <button onClick={onApprove} disabled={approving || rejecting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50">
              {approving ? <Loader size={12} className="animate-spin" /> : <Check size={12} />} Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
