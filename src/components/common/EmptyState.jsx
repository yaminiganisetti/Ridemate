export default function EmptyState({ icon, title = 'Nothing here yet', desc = '', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      {icon && (
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <p className="font-semibold text-slate-700 dark:text-slate-300 text-base">{title}</p>
      {desc && <p className="text-sm text-slate-400 mt-1.5 max-w-xs">{desc}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn btn-primary btn-sm mt-5">{actionLabel}</button>
      )}
    </div>
  )
}
