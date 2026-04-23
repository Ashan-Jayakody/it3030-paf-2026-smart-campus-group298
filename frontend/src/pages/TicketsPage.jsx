import { useState, useEffect, useCallback } from 'react'
import TicketCard from '../components/tickets/TicketCard'
import TicketModal from '../components/tickets/TicketModal'
import TicketDetails from '../components/tickets/TicketDetails'
import { getAllTickets, createTicket } from '../api/ticketApi'
import { useAuth } from '../auth/useAuth'

export default function TicketsPage() {
  const { user, isAdmin } = useAuth()
  const [tickets, setTickets] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (priorityFilter !== 'ALL') params.priority = priorityFilter
      
      const res = await getAllTickets(params)
      setTickets(res.data)
      setError(null)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please sign in.')
      } else {
        setError('Cannot fetch tickets. Make sure the backend is connected.')
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    let list = [...tickets]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => 
        t.category.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [tickets, search])

  const handleCreate = async (formData) => {
    try {
      await createTicket(formData)
      setModalOpen(false)
      fetchTickets()
    } catch {
      alert('Error creating ticket. Please try again.')
    }
  }

  const handleUpdate = () => {
    fetchTickets()
    if (selectedTicket) {
      // Refresh selected ticket data
      getAllTickets().then(res => {
        const updated = res.data.find(t => t.id === selectedTicket.id)
        if (updated) setSelectedTicket(updated)
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Support Tickets</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Manage help requests across campus' : 'Track your support and maintenance requests'}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-700 text-white font-black text-sm rounded-xl shadow-lg shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            + New Ticket
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl px-5 py-4 flex gap-3 items-center flex-wrap mb-6 shadow-sm border border-gray-100">
        <input
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none focus:border-violet-400 transition-colors"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none bg-white cursor-pointer focus:border-violet-400 transition-colors"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          className="px-4 py-2.5 rounded-xl border-2 border-gray-100 text-sm outline-none bg-white cursor-pointer focus:border-violet-400 transition-colors"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-rose-600 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-lg">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl text-center py-20 border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">🎫</div>
          <div className="text-lg font-bold text-slate-600">No tickets found</div>
          <p className="text-slate-400 text-sm mt-2">Any assistance requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onClick={setSelectedTicket}
            />
          ))}
        </div>
      )}

      <TicketModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleCreate}
      />

      {selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}