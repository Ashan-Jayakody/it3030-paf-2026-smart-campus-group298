import { useState, useEffect } from 'react'

const EMPTY = { name: '', type: 'HALL', capacity: '', location: '', availableFrom: '', availableTo: '' }

export default function ResourceModal({ isOpen, onClose, onSave, editData, catalog = {} }) {
  const [form,    setForm]    = useState(EMPTY)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    // Avoid setting state synchronously inside an effect body (can cause cascading renders).
    queueMicrotask(() => {
      const initial = editData ? { ...editData } : EMPTY
      const type = initial.type || 'HALL'
      const presets = catalog?.[type] || []
      const name = initial.name || presets?.[0]?.label || ''
      let availableFrom = '';
      let availableTo = '';
      if (initial.availabilityWindows) {
        const parts = initial.availabilityWindows.split('-');
        if (parts.length === 2) {
          availableFrom = parts[0];
          availableTo = parts[1];
        }
      }
      setForm({ ...initial, type, name, availableFrom, availableTo })
      setErrors({})
    })
  }, [editData, isOpen, catalog])

  if (!isOpen) return null

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name     = 'Name is required'
    if (!form.location.trim())          e.location = 'Location is required'
    if (!form.capacity || form.capacity < 1) e.capacity = 'Capacity must be at least 1'
    if (form.availableFrom && !form.availableTo) e.availableTo = 'Required'
    if (!form.availableFrom && form.availableTo) e.availableFrom = 'Required'
    if (form.availableFrom && form.availableTo && form.availableFrom >= form.availableTo) {
      e.availableTo = 'Must be after start time'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const availabilityWindows = (form.availableFrom && form.availableTo) 
      ? `${form.availableFrom}-${form.availableTo}` 
      : '';
    await onSave({ ...form, capacity: parseInt(form.capacity), availabilityWindows })
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">

        {/* Modal header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-800">
            {editData ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >✕</button>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">

          <Field label="Type">
            <select
              className={inputCls()}
              value={form.type}
              onChange={e => {
                const type = e.target.value
                const presets = catalog?.[type] || []
                const name = presets?.[0]?.label || ''
                setForm(f => ({ ...f, type, name }))
              }}
            >
              {Object.keys(catalog).length
                ? Object.keys(catalog).map(t => <option key={t} value={t}>{t}</option>)
                : ['HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'].map(t => <option key={t} value={t}>{t}</option>)
              }
            </select>
          </Field>

          <Field label="Resource (predefined)" error={errors.name}>
            <select
              className={inputCls(errors.name)}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            >
              {(catalog?.[form.type] || []).map(p => (
                <option key={p.code} value={p.label}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Capacity" error={errors.capacity}>
            <input
              type="number"
              className={inputCls(errors.capacity)}
              placeholder="e.g. 80"
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
            />
          </Field>

          <Field label="Location" error={errors.location}>
            <input
              className={inputCls(errors.location)}
              placeholder="e.g. Block A, Ground Floor"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </Field>

          <div className="flex gap-4">
            <div className="flex-1">
              <Field label="Available From" error={errors.availableFrom}>
                <input
                  type="time"
                  className={inputCls(errors.availableFrom)}
                  value={form.availableFrom || ''}
                  onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))}
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Available To" error={errors.availableTo}>
                <input
                  type="time"
                  className={inputCls(errors.availableTo)}
                  value={form.availableTo || ''}
                  onChange={e => setForm(f => ({ ...f, availableTo: e.target.value }))}
                />
              </Field>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
          >Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
          >{loading ? 'Saving...' : editData ? 'Save Changes' : 'Add Resource'}</button>
        </div>

      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  )
}

const inputCls = (error) =>
  `w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-colors
  ${error ? 'border-rose-300 bg-rose-50' : 'border-gray-200 focus:border-violet-400 bg-white'}`