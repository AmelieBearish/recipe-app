'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../components/AuthProvider'
import { signInWithGoogle } from '../../lib/auth'
import { CATEGORIES } from '../../lib/categories'

export default function DraftsPage() {
  const { user } = useAuth()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    document.title = 'もぐレピ - 下書き一覧'
    if (!user) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'recipes'),
      where('status', '==', 'draft'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  if (!user) return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '32px', textAlign: 'center' }}>
      <p style={{ color: '#9A7060', fontSize: '14px', marginBottom: '16px' }}>下書きを見るにはログインが必要です</p>
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
      <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#3D2314', marginBottom: '24px' }}>下書き一覧</h1>
      {loading && <p style={{ color: '#9A7060', fontSize: '14px' }}>読み込み中...</p>}
      {!loading && drafts.length === 0 && (
        <p style={{ color: '#9A7060', fontSize: '14px' }}>下書きはありません</p>
      )}
      <div style={{ display: 'grid', gap: '14px' }}>
        {drafts.map(recipe => {
          const categoryDefault = CATEGORIES.find(c => c.id === recipe.category)?.defaultImage
          return (
            <a key={recipe.id} href={`/recipes/${recipe.id}/edit`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <img
                  src={recipe.imageUrl || categoryDefault || '/images/categories/other.png'}
                  alt={recipe.title}
                  style={{ width: '90px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ backgroundColor: '#F0F0F0', color: '#9A7060', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', flexShrink: 0 }}>
                      下書き
                    </span>
