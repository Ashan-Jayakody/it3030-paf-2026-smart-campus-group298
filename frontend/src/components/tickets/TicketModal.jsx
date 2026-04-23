import { useState, useEffect } from 'react'
import { getAllResources } from '../../api/resourceApi'

export default function TicketModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    resourceId: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    contactDetails: '',
    attachments: []
  })
  const [resources, setResources] = useState([])
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    if (isOpen) {
      getAllResources().then(res => setResources(res.data))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (formData.attachments.length + files.length > 3) {
      alert('Maximum 3 images allowed')
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result])
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, reader.result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800">Report an Incident</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              ✕
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Affected Resource</label>
              <select
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-violet-400 transition-colors bg-slate-50 text-sm"
                value={formData.resourceId}
                onChange={e => setFormData({ ...formData, resourceId: e.target.value })}
              >
                <option value="">Select a resource...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
                <input
                  required
                  placeholder="e.g. Electrical, Plumbing"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-violet-400 transition-colors bg-slate-50 text-sm"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-violet-400 transition-colors bg-slate-50 text-sm"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea
                required
                rows="3"
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-violet-400 transition-colors bg-slate-50 text-sm resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Contact Details</label>
              <input
                required
                placeholder="Phone number or WhatsApp"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 outline-none focus:border-violet-400 transition-colors bg-slate-50 text-sm"
                value={formData.contactDetails}
                onChange={e => setFormData({ ...formData, contactDetails: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Attachments (Max 3)</label>
              <div className="flex gap-2 mb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-rose-500 text-white p-1 text-[10px] rounded-bl-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {formData.attachments.length < 3 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-xl text-slate-400">+</span>
                    <span className="text-[10px] text-slate-400 font-bold">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 py-4 rounded-xl bg-violet-600 text-white font-extrabold text-sm shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  )
}
