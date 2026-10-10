import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-bold text-slate-200 dark:text-slate-800 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft size={14} /> Go back
          </button>
          <Link to="/" className="btn btn-primary">Home</Link>
        </div>
      </div>
    </div>
  )
}
