import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS   = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info }
const COLORS  = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}
const ICOLOR  = { success: 'text-emerald-500', error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(t => [...t, { id, message, type }])
    if (duration > 0) setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
    return id
  }, [])

  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info
          return (
            <div key={t.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg pointer-events-auto ${COLORS[t.type] || COLORS.info}`}>
              <Icon size={16} className={`shrink-0 mt-0.5 ${ICOLOR[t.type]}`} />
              <span className="text-sm font-medium flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
