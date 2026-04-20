import { useState, useEffect, useCallback } from 'react'
import StatCard from '../components/resources/StatCard'
import ResourceCard from '../components/resources/ResourceCard'
import ResourceModal from '../components/resources/ResourceModal'
import { getAllResources, createResource, updateResource, deleteResource, getResourceCatalog } from '../api/resourceApi'

export default function ResourcesPage() {
  const [resources,  setResources]  = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [catalog,    setCatalog]    = useState({})
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editData,   setEditData]   = useState(null)

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      const [res, cat] = await Promise.all([getAllResources(), getResourceCatalog()])
      setResources(res.data)
      setCatalog(cat.data || {})
      setError(null)
    } catch {
      setError('Cannot connect to the API. Make sure Spring Boot is running on port 8080.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  useEffect(() => {
    let list = [...resources]
    if (typeFilter !== 'ALL') list = list.filter(r => r.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [resources, search, typeFilter])

  const handleSave = async (formData) => {
    try {
      if (editData) await updateResource(editData.id, formData)
      else          await createResource(formData)
      setModalOpen(false)
      setEditData(null)
      fetchResources()
    } catch {
      alert('Error saving. Check that all fields are valid.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    await deleteResource(id)
    fetchResources()
  }

  const openAdd  = ()  => { setEditData(null); setModalOpen(true) }
  const openEdit = (r) => { setEditData(r);    setModalOpen(true) }

  const total       = resources.length
  const activeCount = resources.filter(r => r.status === 'ACTIVE').length
  const outCount    = resources.filter(r => r.status === 'OUT_OF_SERVICE').length

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Facilities & Assets</h1>
        <p className="text-slate-500 mt-1">Manage all bookable resources across campus</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-5 mb-8 flex-wrap">
        <StatCard label="Total Resources" value={total}       color="purple" icon="🏛️" />
        <StatCard label="Active"          value={activeCount} color="green"  icon="✅" />
        <StatCard label="Out of Service"  value={outCount}    color="red"    icon="🔴" />
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl px-5 py-4 flex gap-3 items-center flex-wrap mb-6 shadow-sm border border-gray-100">
        <input
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none focus:border-violet-400 transition-colors"
          placeholder="Search by name or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm outline-none bg-white cursor-pointer focus:border-violet-400 transition-colors"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {['ALL', ...Object.keys(catalog)].map(t => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md shadow-violet-200 whitespace-nowrap"
        >+ Add Resource</button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 text-rose-600 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-slate-400 text-lg">Loading resources...</div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl text-center py-20 border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">🏛️</div>
          <div className="text-lg font-bold text-slate-600">No resources found</div>
          <div className="text-slate-400 text-sm mt-2">
            {resources.length === 0 ? 'Add your first resource to get started.' : 'Try adjusting your filters.'}
          </div>
          {resources.length === 0 && (
            <button onClick={openAdd} className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
              Add First Resource
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r => (
            <ResourceCard key={r.id} resource={r} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ResourceModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        onSave={handleSave}
        editData={editData}
        catalog={catalog}
      />
    </div>
  )
}
