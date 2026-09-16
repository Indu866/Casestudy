import { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { Bell, AlertCircle, Calendar, CheckCheck, Tag, Send, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

const CATEGORY_COLORS = {
  Hostel: 'bg-orange-50 text-orange-700', Transport: 'bg-indigo-50 text-indigo-700',
  Library: 'bg-teal-50 text-teal-700', Electrical: 'bg-yellow-50 text-yellow-700',
  Plumbing: 'bg-sky-50 text-sky-700', Carpentry: 'bg-amber-50 text-amber-700',
  Civil: 'bg-violet-50 text-violet-700', 'IT Support': 'bg-cyan-50 text-cyan-700',
}

function ReminderCard({ r, expandedId, setExpandedId, replyText, onReplyChange, onReplySubmit, replyLoading, onMarkRead }) {
  const isExpanded = expandedId === r.id
  const hasReplies = r.replies?.length > 0

  return (
    <div className={`bg-white rounded-2xl border flex flex-col overflow-hidden transition-all ${r.is_read ? 'border-slate-100' : 'border-amber-200 shadow-sm'}`}>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className={`w-4 h-4 shrink-0 ${r.is_read ? 'text-slate-400' : 'text-amber-500'}`} />
            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{r.complaint_title}</p>
          </div>
          {!r.is_read && (
            <span className="shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">New</span>
          )}
        </div>

        <div className={`text-sm rounded-xl p-3 leading-relaxed ${r.is_read ? 'bg-slate-50 text-slate-500' : 'bg-amber-50 text-amber-900'}`}>
          "{r.message}"
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[r.category] || 'bg-slate-100 text-slate-600'}`}>
            <Tag className="w-3 h-3" />{r.category}
          </span>
          <span>From: <strong className="text-slate-600">{r.sent_by_name}</strong></span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!r.is_read && (
            <button onClick={() => onMarkRead(r.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition">
              <CheckCheck className="w-3.5 h-3.5" /> Mark as read
            </button>
          )}
          <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition ml-auto">
            <MessageSquare className="w-3.5 h-3.5" />
            {hasReplies ? `${r.replies.length} Repl${r.replies.length > 1 ? 'ies' : 'y'}` : 'Reply'}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Reply panel — always rendered when expanded, replies visible after submit */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 flex flex-col gap-3">
          {hasReplies && (
            <div className="space-y-2">
              {r.replies.map((reply, idx) => (
                <div key={reply.id ?? idx} className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className={`text-xs font-semibold mb-1 ${reply.replied_by_name === 'You' ? 'text-primary-600' : 'text-slate-500'}`}>
                    {reply.replied_by_name}
                  </p>
                  <p className="text-sm text-slate-700">{reply.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={e => onReplyChange(r.id, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onReplySubmit(r.id)}
              placeholder="Type your reply to the coordinator..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={() => onReplySubmit(r.id)}
              disabled={replyLoading === r.id || !replyText?.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium transition">
              {replyLoading === r.id
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [replyLoading, setReplyLoading] = useState(null)

  useEffect(() => { fetchReminders() }, [])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const data = await api.get('/staff/reminders')
      setReminders(data.reminders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    try {
      await api.put(`/staff/reminders/${id}/read`)
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReplyChange = (reminderId, value) => {
    setReplyText(prev => ({ ...prev, [reminderId]: value }))
  }

  const sendReply = async (reminderId) => {
    const msg = replyText[reminderId]?.trim()
    if (!msg) return
    setReplyLoading(reminderId)
    try {
      const data = await api.post(`/staff/reminders/${reminderId}/reply`, { message: msg })
      setReminders(prev => prev.map(r =>
        r.id === reminderId
          ? {
              ...r,
              is_read: true,   // mark read on reply
              replies: [
                ...(r.replies || []),
                {
                  id: data.reply.id,
                  reminder_id: reminderId,
                  message: msg,
                  replied_by_name: 'You',
                  created_at: new Date().toISOString(),
                }
              ]
            }
          : r
      ))
      setReplyText(prev => ({ ...prev, [reminderId]: '' }))
      setExpandedId(reminderId) // keep panel open
    } catch (err) {
      alert(err.message)
    } finally {
      setReplyLoading(null)
    }
  }

  // Don't split into unread/read sections — keep all reminders in one flat list
  // so a reminder doesn't "jump" to another section after replying (which loses expanded state)
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700">
      <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
    </div>
  )

  const unreadCount = reminders.filter(r => !r.is_read).length

  const cardProps = (r) => ({
    r,
    expandedId,
    setExpandedId,
    replyText: replyText[r.id] || '',
    onReplyChange: handleReplyChange,
    onReplySubmit: sendReply,
    replyLoading,
    onMarkRead: markRead,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          {reminders.length === 0
            ? 'No reminders yet.'
            : `${reminders.length} reminder${reminders.length !== 1 ? 's' : ''} · ${unreadCount} unread`}
        </p>
        <button onClick={fetchReminders}
          className="text-sm text-primary-600 font-medium bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition">
          Refresh
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Bell className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-display font-semibold text-lg text-slate-500">No reminders</p>
          <p className="text-sm mt-1">Coordinator reminders will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(r => <ReminderCard key={r.id} {...cardProps(r)} />)}
        </div>
      )}
    </div>
  )
}