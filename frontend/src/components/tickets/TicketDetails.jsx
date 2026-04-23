import { useState } from 'react'
import StatusBadge from './StatusBadge'
import CommentSection from './CommentSection'
import { updateTicketStatus, assignTechnician } from '../../api/ticketApi'
import { useAuth } from '../../auth/useAuth'

export default function TicketDetails({ ticket, onUpdate, onClose }) {
  const { isAdmin } = useAuth()
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [techId, setTechId] = useState(ticket.technicianId || '')

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'REJECTED' && !showRejectForm) {
      setShowRejectForm(true)
      return
    }
    await updateTicketStatus(ticket.id, newStatus, rejectReason)
    setShowRejectForm(false)
    onUpdate()
  }

  const handleAssign = async () => {
    await assignTechnician(ticket.id, techId)
    onUpdate()
  }

  const getNextStatus = () => {
    switch (ticket.status) {
      case 'OPEN': return 'IN_PROGRESS'
      case 'IN_PROGRESS': return 'RESOLVED'
      case 'RESOLVED': return 'CLOSED'
      default: return null
    }
  }

  const nextStatus = getNextStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex gap-2 items-center mb-1">
              <StatusBadge status={ticket.status} />
              <span className="text-[10px] font-black uppercase text-slate-400">ID: {ticket.id.slice(-6)}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">{ticket.category}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Description & Details</h3>
            <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {ticket.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-2xl border border-slate-100">
                <span className="block text-[10px] font-black text-slate-300 uppercase mb-1">Priority</span>
                <span className="text-sm font-bold text-slate-700">{ticket.priority}</span>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100">
                <span className="block text-[10px] font-black text-slate-300 uppercase mb-1">Contact</span>
                <span className="text-sm font-bold text-slate-700">{ticket.contactDetails}</span>
              </div>
            </div>
          </section>

          {ticket.attachments?.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Attachments</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {ticket.attachments.map((url, i) => (
                  <img key={i} src={url} className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-100 shadow-sm" alt="" />
                ))}
              </div>
            </section>
          )}

          {isAdmin && (
            <section className="p-6 rounded-3xl bg-violet-50 border border-violet-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-violet-400">Admin Controls</h3>
              
              <div className="flex gap-3 flex-wrap">
                {nextStatus && (
                  <button 
                    onClick={() => handleStatusChange(nextStatus)}
                    className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200"
                  >
                    Move to {nextStatus.replace('_', ' ')}
                  </button>
                )}
                {ticket.status !== 'REJECTED' && ticket.status !== 'CLOSED' && (
                  <button 
                    onClick={() => setShowRejectForm(true)}
                    className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold"
                  >
                    Reject Ticket
                  </button>
                )}
              </div>

              {showRejectForm && (
                <div className="mt-4 space-y-2">
                  <textarea
                    placeholder="Reason for rejection..."
                    className="w-full p-3 rounded-xl border border-rose-200 text-sm outline-none focus:border-rose-400"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusChange('REJECTED')} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Confirm Reject</button>
                    <button onClick={() => setShowRejectForm(false)} className="text-rose-400 text-xs font-bold">Cancel</button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-end pt-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-violet-300 uppercase mb-1">Assign Technician ID</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm outline-none focus:border-violet-400 bg-white"
                    placeholder="User ID..."
                    value={techId}
                    onChange={e => setTechId(e.target.value)}
                  />
                </div>
                <button onClick={handleAssign} className="px-4 py-2 bg-white border border-violet-200 text-violet-600 rounded-lg text-xs font-bold">Update</button>
              </div>
            </section>
          )}

          {ticket.rejectionReason && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
              <span className="block text-[10px] font-black text-rose-300 uppercase mb-1">Rejection Reason</span>
              <p className="text-sm text-rose-700 italic">"{ticket.rejectionReason}"</p>
            </div>
          )}

          <CommentSection ticketId={ticket.id} />
        </div>
      </div>
    </div>
  )
}
