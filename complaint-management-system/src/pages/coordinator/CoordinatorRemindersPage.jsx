import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Bell, AlertCircle, Calendar, Tag, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
  Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
  Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
}

export default function CoordinatorRemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchReminders() }, [])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const data = await api.get('/coordinator/reminders')
      setReminders(data.reminders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const withReplies = reminders.filter(r => r.replies?.length > 0)
  const withoutReplies = reminders.filter(r => !r.replies?.length)

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
      <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
    </div>
  )

  const ReminderCard = ({ r }) => {
    const isExpanded = expandedId === r.id
    const hasReplies = r.replies?.length > 0
    return (
      <div className={`bg-white rounded-2xl border flex flex-col overflow-hidden transition-all ${hasReplies ? 'border-emerald-200' : 'border-slate-100'}`}>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className={`w-4 h-4 shrink-0 ${hasReplies ? 'text-emerald-500' : 'text-amber-500'}`} />
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{r.complaint_title}</p>
            </div>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium border ${
              hasReplies ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {hasReplies ? `${r.replies.length} Repl${r.replies.length > 1 ? 'ies' : 'y'}` : 'No reply yet'}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 leading-relaxed">
            Your reminder: "{r.message}"
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[r.category] || 'bg-slate-100 text-slate-600'}`}>
              <Tag className="w-3 h-3" />{r.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {hasReplies && (
            <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
              className="self-start flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition">
              <MessageSquare className="w-3.5 h-3.5" />
              {isExpanded ? 'Hide replies' : 'View replies'}
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {isExpanded && hasReplies && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-2">
            {r.replies.map(reply => (
              <div key={reply.id} className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-xs font-semibold text-violet-600 mb-1">{reply.replied_by_name} replied</p>
                <p className="text-sm text-slate-700">{reply.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          {reminders.length === 0 ? 'No reminders sent yet.' : `${reminders.length} reminder${reminders.length !== 1 ? 's' : ''} · ${withReplies.length} replied`}
        </p>
        <button onClick={fetchReminders}
          className="text-sm text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Bell className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No reminders sent</p>
          <p className="text-sm mt-1">Send reminders from the Complaints tab</p>
        </div>
      ) : (
        <>
          {withReplies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Replied ({withReplies.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {withReplies.map(r => <ReminderCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
          {withoutReplies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Awaiting reply ({withoutReplies.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {withoutReplies.map(r => <ReminderCard key={r.id} r={r} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}