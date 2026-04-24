import { useState, useEffect } from 'react'
import { getCommentsByTicket, addComment, updateComment, deleteComment } from '../../api/ticketApi'
import { useAuth } from '../../auth/useAuth'

export default function CommentSection({ ticketId }) {
  const { user, isAdmin } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [ticketId])

  const fetchComments = async () => {
    const res = await getCommentsByTicket(ticketId)
    setComments(res.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment(ticketId, { content: newComment })
    setNewComment('')
    fetchComments()
  }

  const handleUpdate = async (id) => {
    await updateComment(id, { content: editContent })
    setEditingId(null)
    fetchComments()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this comment?')) {
      await deleteComment(id)
      fetchComments()
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-slate-800">Discussion</h3>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-violet-400 text-sm"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700">
          Post
        </button>
      </form>

      <div className="space-y-4">
        {comments.map(c => (
          <div key={c.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{c.authorName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              
              {(isAdmin || c.authorId === user.id) && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingId(c.id); setEditContent(c.content) }}
                    className="text-slate-400 hover:text-blue-500 text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="text-slate-400 hover:text-rose-500 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingId === c.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-400">Cancel</button>
                  <button onClick={() => handleUpdate(c.id)} className="text-xs font-bold text-violet-600">Save</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
