import { AlertCircle, RefreshCw } from 'lucide-react'
export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="font-semibold text-ink-700 mb-1">Error</p>
      <p className="text-sm text-ink-400 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm mt-5 px-5 py-2.5 flex items-center gap-2 mx-auto">
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  )
}
