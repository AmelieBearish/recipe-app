'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import ImageUpload from '../../../../components/ImageUpload'
import { useAuth } from '../../../../components/AuthProvider'

import { CATEGORIES } from '../../../../lib/categories'

export default function EditRecipe({ params }) {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      const snap = await getDoc(doc(db, 'recipes', params.id))
      if (snap.exists()) {
        const data = snap.data()
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          cookTime: data.cookTime || '',
          ingredients: (data.ingredients || []).join('\n'),
          steps: (data.steps || []).join('\n'),
          imageUrl: data.imageUrl || '',
          authorId: data.authorId || null,
        })
      }
      setLoading(false)
    }
    fetchRecipe()
  }, [params.id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await updateDoc(doc(db, 'recipes', params.id), {
        title: form.title,
        description: form.description,
        category: form.category,
        cookTime: Number(form.cookTime) || 0,
        ingredients: form.ingredients.split('\n').filter(l => l.trim()),
        steps: form.steps.split('\n').filter(l => l.trim()),
        imageUrl: form.imageUrl,
      })
      window.location.href = '/recipes/' + params.id
    } catch (err) {
      alert('更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p style={{ color: '#9A7060', fontSize: '14px' }}>読み込み中...</p>
  if (!form) return <p style={{ color: '#9A7060', fontSize: '14px' }}>レシピが見つかりません</p>
  if (!user || !form.authorId || user.uid !== form.authorId) return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '32px', textAlign: 'center' }}>
      <p style={{ color: '#9A7060', fontSize: '14px' }}>編集する権限がありません</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">レシピを編集</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">料理名 *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">説明</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">カテゴリ</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>
          <div className="w-28">
            <label className="block text-sm font-bold text-gray-700 mb-1">調理時間（分）</label>
            <input
              name="cookTime"
              value={form.cookTime}
              onChange={handleChange}
              type="number"
              min="0"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">材料（1行に1つ）</label>
          <textarea
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">手順（1行に1ステップ）</label>
          <textarea
            name="steps"
            value={form.steps}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">写真</label>
          <ImageUpload onUpload={(url) => setForm({ ...form, imageUrl: url })} />
          {form.imageUrl && (
            <div className="mt-2">
              <img src={form.imageUrl} alt="現在の写真" className="rounded w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, imageUrl: '' })}
                className="mt-1 text-sm text-red-500 hover:text-red-700"
              >
                写真を削除
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? '更新中...' : '更新する'}
          </button>
          
            <a href={'/recipes/' + params.id}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold text-center hover:bg-gray-200"
          >
            キャンセル
          </a>
        </div>
      </form>
    </div>
  )
}
