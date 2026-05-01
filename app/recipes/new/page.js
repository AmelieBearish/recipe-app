'use client'
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import ImageUpload from '../../../components/ImageUpload'

const CATEGORIES = ['主菜', '副菜', '汁物', '丼・麺', 'おやつ・デザート', 'その他']

export default function NewRecipe() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '主菜',
    cookTime: '',
    ingredients: '',
    steps: '',
    imageUrl: '',
    password: '',
    originId: '',
    originTitle: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [loadingOrigin, setLoadingOrigin] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const originId = params.get('originId')
    if (!originId) return
    setLoadingOrigin(true)
    const fetchOrigin = async () => {
      const snap = await getDoc(doc(db, 'recipes', originId))
      if (snap.exists()) {
        const data = snap.data()
        setForm(f => ({
          ...f,
          title: '【アレンジ】' + data.title,
          description: data.description || '',
          category: data.category || '主菜',
          cookTime: data.cookTime || '',
          ingredients: (data.ingredients || []).join('\n'),
          steps: (data.steps || []).join('\n'),
          imageUrl: data.imageUrl || '',
          originId: originId,
          originTitle: data.title,
        }))
      }
      setLoadingOrigin(false)
    }
    fetchOrigin()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (!form.password.trim()) {
      alert('パスワードを入力してください')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'recipes'), {
        title: form.title,
        description: form.description,
        category: form.category,
        cookTime: Number(form.cookTime) || 0,
        ingredients: form.ingredients.split('\n').filter(l => l.trim()),
        steps: form.steps.split('\n').filter(l => l.trim()),
        imageUrl: form.imageUrl,
        password: form.password,
        originId: form.originId || null,
        originTitle: form.originTitle || null,
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

  if (loadingOrigin) return <p style={{ color: '#9A7060', fontSize: '14px' }}>読み込み中...</p>

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#3D2314', marginBottom: '24px' }}>
        {form.originId ? 'アレンジレシピを追加' : 'レシピを追加'}
      </h1>
      {form.originId && (
        <div style={{ backgroundColor: '#FFF0E6', border: '1px solid #F0E6DC', borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#C07048' }}>
          元レシピ：{form.originTitle}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>料理名 *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
            placeholder="例：肉じゃが" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>説明</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2}
            style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
            placeholder="例：ほっこり定番の煮物です" />
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>カテゴリ</label>
            <select name="category" value={form.category} onChange={handleChange}
              style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ width: '120px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>調理時間（分）</label>
            <input name="cookTime" value={form.cookTime} onChange={handleChange} type="number" min="0"
              style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
              placeholder="30" />
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>材料（1行に1つ）</label>
          <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={4}
            style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
            placeholder={"じゃがいも 3個\n玉ねぎ 1個\n豚肉 200g"} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>手順（1行に1ステップ）</label>
          <textarea name="steps" value={form.steps} onChange={handleChange} rows={4}
            style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
            placeholder={"じゃがいもを一口大に切る\n玉ねぎをくし切りにする\n鍋に油を熱し炒める"} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>写真</label>
          <ImageUpload onUpload={(url) => setForm({ ...form, imageUrl: url })} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>パスワード *（編集・削除に使用します）</label>
          <input name="password" value={form.password} onChange={handleChange} type="text"
            style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
            placeholder="自分だけが知るパスワードを設定" />
          <p style={{ fontSize: '12px', color: '#B09080', marginTop: '4px' }}>※ パスワードを忘れると編集・削除できなくなります</p>
        </div>
        <button type="submit" disabled={submitting}
          style={{ width: '100%', backgroundColor: '#E8A87C', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          {submitting ? '登録中...' : 'レシピを登録する'}
        </button>
      </form>
    </div>
  )
}
