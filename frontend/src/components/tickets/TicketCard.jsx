import StatusBadge from './StatusBadge'

export default function TicketCard({ ticket, onClick }) {
  const priorityColors = {
    LOW: 'text-blue-500',
    MEDIUM: 'text-amber-500',
    HIGH: 'text-rose-500',
  }

  return (
    <div 
      onClick={() => onClick(ticket)}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <StatusBadge status={ticket.status} />
        <span className={`text-xs font-black tracking-wider ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      
      <h3 className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors line-clamp-1">
        {ticket.category}
      </h3>
      <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[2.5rem]">
        {ticket.description}
      </p>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
        {ticket.technicianId && <span className="text-violet-500">Technician Assigned</span>}
      </div>
    </div>
  )
}
