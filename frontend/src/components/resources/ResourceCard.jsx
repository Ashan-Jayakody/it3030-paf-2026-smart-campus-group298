const TYPE_BADGE = {
  HALL: 'bg-violet-100 text-violet-700',
  LAB: 'bg-blue-100 text-blue-700',
  MEETING_ROOM: 'bg-emerald-100 text-emerald-700',
  EQUIPMENT: 'bg-amber-100 text-amber-700',
}

const TYPE_BORDER = {
  HALL: 'border-t-violet-500',
  LAB: 'border-t-blue-500',
  MEETING_ROOM: 'border-t-emerald-500',
  EQUIPMENT: 'border-t-amber-500',
}

const TYPE_LABEL = {
  HALL: 'Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
}

export default function ResourceCard({ resource, onEdit, onDelete, canManage = false, isAdmin = false, onStatusChange }) {
  const badgeClass = TYPE_BADGE[resource.type] || 'bg-gray-100 text-gray-700'
  const borderClass = TYPE_BORDER[resource.type] || 'border-t-gray-400'
  const isActive = resource.status === 'AVAILABLE'

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-t-4 ${borderClass} flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight mb-2">
            {resource.name}
          </h3>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
            {TYPE_LABEL[resource.type] || resource.type}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isActive ? 'AVAILABLE' : 'OUT OF SERVICE'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { icon: '📍', text: resource.location },
          { icon: '👥', text: `Capacity: ${resource.capacity}` },
          { icon: '🕐', text: resource.availabilityWindows || 'No schedule set' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-sm text-slate-500">{text}</span>
          </div>
        ))}
      </div>

      {canManage && (
        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
          {isAdmin && (
            <button
              onClick={() => onStatusChange(resource.id, resource.status === 'AVAILABLE' ? 'OUT_OF_SERVICE' : 'AVAILABLE')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                resource.status === 'AVAILABLE'
                  ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
              }`}
            >
              {resource.status === 'AVAILABLE' ? 'OUT OF SERVICE' : 'AVAILABLE'}
            </button>
          )}
          <button
            onClick={() => onEdit(resource)}
            className="flex-1 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-semibold border border-violet-100 hover:bg-violet-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}