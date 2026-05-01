'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, increment, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import CommentSection from '../../../components/CommentSection'

export default function RecipeDetail({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [arranges, setArranges] = useState([])

  useEffect(() => {
    const fetchRecipe = async () => {
      const snap = await getDoc(doc(db, 'recipes', params.id))
      if (snap.exists()) {
        setRecipe({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }
    fetchRecipe()
  }, [params.id])

  useEffect(() => {
    const q = query(collection(db, 'recipes'), where('originId', '==', params.id))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArranges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [params.id])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setRecipe(r => ({ ...r, likes: (r.likes || 0) + 1 }))
    await updateDoc(doc(db, 'recipes', params.id), {
      likes: increment(1)
    })
  }

  const handleDelete = async () => {
    if (deletePassword !== recipe.password) {
      alert('パスワードが違います')
      return
    }
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'recipes', params.id))
      window.location.href = '/'
    } catch (err) {
      alert('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p style={{ color: '#9A7060', fontSize: '14px' }}>読み込み中...</p>
  if (!recipe) return <p style={{ color: '#9A7060', fontSize: '14px' }}>レシピが見つかりません</p>

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '24px' }}>
      {recipe.originId && (
        <div style={{ backgroundColor: '#FFF0E6', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '8px 14px', marginBottom: '16px', fontSize: '13px' }}>
          元レシピ：
          <a href={'/recipes/' + recipe.originId} style={{ color: '#C07048', fontWeight: '500', textDecoration: 'none' }}>
            {recipe.originTitle}
          </a>
        </div>
      )}

      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt={recipe.title}
          style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '11px', padding: '3px 12px', borderRadius: '20px', fontWeight: '500' }}>
          {recipe.category}
        </span>
        <span style={{ fontSize: '12px', color: '#B09080' }}>{recipe.cookTime}分</span>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#3D2314', marginBottom: '8px' }}>{recipe.title}</h1>
      <p style={{ fontSize: '14px', color: '#9A7060', lineHeight: '1.7', marginBottom: '24px' }}>{recipe.description}</p>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#5C3D2E', marginBottom: '10px' }}>材料</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recipe.ingredients?.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#5C3D2E', padding: '6px 0', borderBottom: '1px solid #F5EDE6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#E8A87C', fontWeight: '600' }}>・</span>{item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#5C3D2E', marginBottom: '10px' }}>手順</h2>
        <ol style={{ listStyle: 'none', padding: 0 }}>
          {recipe.steps?.map((step, i) => (
            <li key={i} style={{ fontSize: '14px', color: '#5C3D2E', padding: '8px 0', borderBottom: '1px solid #F5EDE6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ backgroundColor: '#E8A87C', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, fontWeight: '600' }}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={handleLike} disabled={liked}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: liked ? 'default' : 'pointer', backgroundColor: liked ? '#FFE4E4' : '#F5EDE6', color: liked ? '#E07070' : '#9A7060', fontSize: '14px', fontWeight: '500' }}>
          ❤ {liked ? 'ありがとう！' : '好き！'} {recipe.likes || 0}
        </button>
        <a href={'/recipes/new?originId=' + params.id}
          style={{ display: 'inline-block', padding: '8px 18px', borderRadius: '20px', backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '14px', fontWeight: '500', textDecoration: 'none', border: '1px solid #F0E6DC' }}>
          アレンジする
        </a>
      </div>

      <CommentSection recipeId={params.id} />

      {arranges.length > 0 && (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F0E6DC' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#5C3D2E', marginBottom: '12px' }}>このレシピのアレンジ</h3>
          <div>
            {arranges.map(a => (
              <a key={a.id} href={'/recipes/' + a.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#FFF8F4', borderRadius: '10px', border: '1px solid #F0E6DC', marginBottom: '8px', textDecoration: 'none' }}>
                {a.imageUrl && (
                  <img src={a.imageUrl} alt={a.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#3D2314', marginBottom: '2px' }}>{a.title}</p>
                  <p style={{ fontSize: '12px', color: '#B09080' }}>❤ {a.likes || 0}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
        <a href={'/recipes/' + params.id + '/edit'}
          style={{ backgroundColor: '#F5EDE6', color: '#5C3D2E', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
          編集
        </a>
        <button onClick={() => setShowDeleteModal(true)}
          style={{ backgroundColor: '#FDECEA', color: '#C0392B', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>
          削除
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        <a href="/" style={{ color: '#C07048', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
          ← 一覧に戻る
        </a>
      </div>

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '320px' }}>
            <h3 style={{ fontWeight: '600', color: '#3D2314', marginBottom: '8px' }}>レシピを削除しますか？</h3>
            <p style={{ fontSize: '13px', color: '#9A7060', marginBottom: '16px' }}>パスワードを入力してください</p>
            <input type="text" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
              style={{ width: '100%', border: '1px solid #F0E6DC', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', marginBottom: '16px' }}
              placeholder="パスワード" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword('') }}
                style={{ flex: 1, backgroundColor: '#F5EDE6', color: '#5C3D2E', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                キャンセル
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, backgroundColor: '#E8A87C', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
