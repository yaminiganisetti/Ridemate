export default function EmptyState({ icon = '📭', title = 'Nothing here yet', desc = '', action, actionLabel }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-display font-bold text-ink-700 text-base mb-1">{title}</p>
      {desc && <p className="text-sm text-ink-400 max-w-xs mx-auto">{desc}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary text-sm mt-5 px-5 py-2.5">{actionLabel}</button>
      )}
    </div>
  )
}
