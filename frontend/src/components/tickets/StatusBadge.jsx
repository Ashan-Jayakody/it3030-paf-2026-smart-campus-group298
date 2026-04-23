export default function StatusBadge({ status }) {
  const styles = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-50 text-slate-600 border-slate-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.CLOSED}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
