'use client'
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import ImageUpload from '../../../components/ImageUpload'

const CATEGORIES = ['主菜', '副菜', '汁物', '丼・麺','おやつ・デザート', 'その他']

export default function NewRecipe() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '主菜',
    cookTime: '',
    ingredients: '',
    steps: '',
    imageUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'recipes'), {
        ...form,
        cookTime: Number(form.cookTime) || 0,
        ingredients: form.ingredients.split('\n').filter(l => l.trim()),
        steps: form.steps.split('\n').filter(l => l.trim()),
        likes: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
      })
      window.location.href = '/'
    } catch (err) {
      alert('レシピの登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">レシピを追加</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">料理名 *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="例：肉じゃが"
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
            placeholder="例：ほっこり定番の煮物です"
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
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
              placeholder="30"
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
            placeholder={"じゃがいも 3個\n玉ねぎ 1個\n豚肉 200g"}
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
            placeholder={"じゃがいもを一口大に切る\n玉ねぎをくし切りにする\n鍋に油を熱し炒める"}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">写真</label>
          <ImageUpload onUpload={(url) => setForm({ ...form, imageUrl: url })} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? '登録中...' : 'レシピを登録する'}
        </button>
      </form>
    </div>
  )
}
