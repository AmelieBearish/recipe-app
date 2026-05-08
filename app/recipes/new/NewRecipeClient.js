'use client'
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import ImageUpload from '../../../components/ImageUpload'
import { useAuth } from '../../../components/AuthProvider'
import { signInWithGoogle } from '../../../lib/auth'
import { CATEGORIES } from '../../../lib/categories'

export default function NewRecipeClient() {
  const { user } = useAuth()
  const [popupBlocked, setPopupBlocked] = useState(false)
  const handleLogin = async () => {
    try {
      setPopupBlocked(false)
      await signInWithGoogle()
    } catch (e) {
      if (e.code === 'auth/popup-blocked') {
        setPopupBlocked(true)
      }
    }
  }
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].id,
    cookTime: '',
    ingredients: [{ name: '', amount: '' }],
    steps: '',
    imageUrl: '',
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
          category: data.category || CATEGORIES[0].id,
          cookTime: data.cookTime || '',
          ingredients: (data.ingredients || []).length > 0
            ? (data.ingredients || []).map(ing =>
                typeof ing === 'string'
                  ? { name: ing, amount: '' }
                  : { name: ing.name || '', amount: ing.amount || '' }
              )
            : [{ name: '', amount: '' }],
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

  const handleIngredientChange = (index, field, value) => {
    const updated = form.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    )
    setForm({ ...form, ingredients: updated })
  }

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: '' }] })
  }

  const removeIngredient = (index) => {
    if (form.ingredients.length === 1) return
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) })
  }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
     await addDoc(collection(db, 'recipes'), {
        title: form.title,
        description: form.description,
        category: form.category,
        cookTime: Number(form.cookTime) || 0,
        ingredients: form.ingredients.filter(ing => ing.name.trim()),
        steps: form.steps.split('\n').filter(l => l.trim()),
        imageUrl: form.imageUrl,
        authorId: user.uid,
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
  if (!user) return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '32px', textAlign: 'center' }}>
      <p style={{ color: '#9A7060', fontSize: '14px', marginBottom: '16px' }}>レシピを投稿するにはログインが必要です</p>
      <button onClick={handleLogin} style={{ backgroundColor: '#C07048', color: '#fff', border: 'none', borderRadius: '20px', padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
        Googleでログイン
      </button>
      {popupBlocked && (
        <p style={{ fontSize: '11px', color: '#C07048', marginTop: '8px' }}>ポップアップを許可してください</p>
      )}
    </div>
  )

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
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
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
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#5C3D2E', marginBottom: '6px' }}>材料</label>
          {form.ingredients.map((ing, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                style={{ flex: 2, border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
                placeholder="例：じゃがいも"
              />
              <input
                value={ing.amount}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                style={{ flex: 1, border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
                placeholder="例：3個"
              />
              <button type="button" onClick={() => removeIngredient(index)}
                style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #F0E6DC', backgroundColor: '#fff', color: '#B09080', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}
            style={{ marginTop: '4px', fontSize: '13px', color: '#C07048', backgroundColor: '#FFF0E6', border: '1px solid #F0E6DC', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer' }}>
            ＋ 材料を追加
          </button>
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
        <button type="submit" disabled={submitting}
          style={{ width: '100%', backgroundColor: '#E8A87C', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
          {submitting ? '登録中...' : 'レシピを登録する'}
        </button>
      </form>
    </div>
  )
}
