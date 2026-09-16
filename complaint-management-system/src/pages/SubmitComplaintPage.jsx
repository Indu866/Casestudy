import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { CheckCircle, Send, AlertCircle } from 'lucide-react'

export default function SubmitComplaintPage() {
  const [form, setForm] = useState({ title: '', description: '', category_id: '' })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [duplicateComplaint, setDuplicateComplaint] = useState(null); // Add this line
  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/categories')
        setCategories(data)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    else if (form.title.trim().length < 8) e.title = 'Title must be at least 8 characters'
    if (!form.description.trim()) e.description = 'Description is required'
    else if (form.description.trim().length < 20) e.description = 'Please provide more detail (at least 20 characters)'
    if (!form.category_id) e.category_id = 'Please select a category'
    return e
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitError('');
    setDuplicateComplaint(null); // Reset duplicate complaint state
    setLoading(true);
    try {
      const data = await api.post('/complaints', {
        title: form.title,
        description: form.description,
        category_id: parseInt(form.category_id),
      });
      setSubmittedData(data.complaint);
      setSubmitted(true);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // Handle duplicate complaint
        setDuplicateComplaint(err.response.data.existingComplaint);
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category_id: '' })
    setSubmitted(false)
    setSubmittedData(null)
    setSubmitError('')
  }

  const selectedCategoryName = categories.find(c => c.id === parseInt(form.category_id))?.name || ''

  if (submitted && submittedData) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Complaint Submitted!</h2>
        <p className="text-slate-500 mb-8">Your complaint has been logged. We'll notify you of any updates.</p>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-8 text-left">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Summary</p>
          <p className="text-xs text-slate-400 mb-1">ID: <span className="font-mono text-slate-600">#{submittedData.id}</span></p>
          <p className="font-semibold text-slate-800 mb-1">{submittedData.title}</p>
          <p className="text-sm text-slate-500 line-clamp-2">{submittedData.description}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-primary-50 text-primary-700 font-medium px-2.5 py-1 rounded-full">{selectedCategoryName}</span>
            <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-full">{submittedData.status}</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">{submittedData.severity}</span>
          </div>
        </div>
        <button onClick={resetForm}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8 animate-fade-in">
        <h2 className="text-xl font-display font-bold text-slate-800 mb-1">New Complaint</h2>
        <p className="text-slate-500 text-sm mb-6">Fill in the details below. Be as specific as possible.</p>

        {submitError && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-700 text-sm mb-5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{submitError}</span>
          </div>
        )}

          {/* Add the duplicate complaint display here */}
      {duplicateComplaint && (
        <div className="flex flex-col gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm mb-5">
          <p className="font-medium">A similar complaint already exists:</p>
          <p><strong>Title:</strong> {duplicateComplaint.title}</p>
          <p><strong>Description:</strong> {duplicateComplaint.description}</p>
          <p><strong>Status:</strong> {duplicateComplaint.status}</p>
        </div>
      )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Complaint Title <span className="text-rose-400">*</span>
            </label>
            <input type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Broken projector in Room 204"
              className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm ${errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`} />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category <span className="text-rose-400">*</span>
            </label>
            <select value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm appearance-none cursor-pointer ${errors.category_id ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}>
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1.5 text-xs text-rose-600">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={5}
              placeholder="Describe the issue in detail. Include location, time, and any relevant context..."
              className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm resize-none ${errors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`} />
            <div className="flex justify-between items-start mt-1.5">
              {errors.description ? <p className="text-xs text-rose-600">{errors.description}</p> : <span />}
              <p className="text-xs text-slate-400 ml-auto">{form.description.length} chars</p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit Complaint</>}
            </button>
            <button type="button"
              onClick={() => { setForm({ title: '', description: '', category_id: '' }); setErrors({}); setSubmitError('') }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition">
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}