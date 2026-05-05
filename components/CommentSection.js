'use client'
import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function CommentSection({ recipeId }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'recipes', recipeId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [recipeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'recipes', recipeId, 'comments'), {
        name: name.trim(),
        body: body.trim(),
        createdAt: serverTimestamp(),
      })
      setBody('')
    } catch (err) {
      alert('コメントの投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg mb-4">💬 コメント</h3>
      <div className="mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">まだコメントはありません</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} style={{ borderBottom: '1px solid #F0E6DC', padding: '8px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C07048', flexShrink: 0 }}>{comment.name}</span>
            <span style={{ fontSize: '13px', color: '#C07048', flexShrink: 0 }}>＜</span>
            <span style={{ fontSize: '13px', color: '#5C3D2E', flex: 1, minWidth: '120px', wordBreak: 'break-all' }}>{comment.body}</span>
            <span style={{ fontSize: '12px', color: '#B09080', flexShrink: 0, marginLeft: 'auto' }}>
              {comment.createdAt?.toDate
                ? (() => {
                    const d = comment.createdAt.toDate()
                    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                  })()
                : ''}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="お名前"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          placeholder="コメントを入力..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? '投稿中...' : 'コメントする'}
        </button>
      </form>
    </div>
  )
}
