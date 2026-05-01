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
      <div className="space-y-3 mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">まだコメントはありません</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-bold text-gray-700">{comment.name}</p>
            <p className="text-sm text-gray-600 mt-1">{comment.body}</p>
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
