import { AlertCircle, RefreshCw } from 'lucide-react'
export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
        <AlertCircle size={20} className="text-red-600" />
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-300">Error</p>
      <p className="text-sm text-slate-400 mt-1.5 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm mt-5 flex items-center gap-2">
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  )
}
