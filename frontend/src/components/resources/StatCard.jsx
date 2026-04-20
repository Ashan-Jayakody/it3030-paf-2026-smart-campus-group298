const STYLES = {
  purple: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
  green:  { gradient: 'from-emerald-400 to-teal-500',  bg: 'bg-emerald-50', text: 'text-emerald-700' },
  red:    { gradient: 'from-rose-400 to-pink-500',     bg: 'bg-rose-50',    text: 'text-rose-700' },
}

export default function StatCard({ label, value, color, icon }) {
  const s = STYLES[color] || STYLES.purple
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm flex-1 border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-slate-800 leading-none">{value}</div>
        <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  )
}