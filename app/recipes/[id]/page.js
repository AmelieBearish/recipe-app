'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, increment, deleteDoc, collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import CommentSection from '../../../components/CommentSection'
import { useAuth } from '../../../components/AuthProvider'
import { checkLiked, addLike, removeLike } from '../../../lib/favorites'

export default function RecipeDetail({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [arranges, setArranges] = useState([])
  const [showShoppingModal, setShowShoppingModal] = useState(false)
  const [pantryItems, setPantryItems] = useState([])
  const [addingToShopping, setAddingToShopping] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      const snap = await getDoc(doc(db, 'recipes', params.id))
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setRecipe(data)
        document.title = 'もぐレピ - ' + data.title
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

  useEffect(() => {
    if (!user) return
    checkLiked(user.uid, params.id).then(result => setLiked(result))
  }, [user, params.id])

  useEffect(() => {
    if (!user) return
    const fetchPantry = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'pantry'))
      setPantryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchPantry()
  }, [user])

  const handleLike = async () => {
    if (!user) return
    if (liked) {
      setLiked(false)
      setRecipe(r => ({ ...r, likes: Math.max((r.likes || 0) - 1, 0) }))
      await removeLike(user.uid, params.id)
      await updateDoc(doc(db, 'recipes', params.id), { likes: increment(-1) })
    } else {
      setLiked(true)
      setRecipe(r => ({ ...r, likes: (r.likes || 0) + 1 }))
      await addLike(user.uid, recipe)
      await updateDoc(doc(db, 'recipes', params.id), { likes: increment(1) })
    }
  }

  const handleDelete = async () => {
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

  const getPantryStatus = (ingredientName) => {
    const found = pantryItems.find(p => p.name.includes(ingredientName) || ingredientName.includes(p.name))
    return found ? found.status : null
  }

  const handleAddToShopping = async () => {
    if (!user || !recipe) return
    setAddingToShopping(true)
    try {
      const ingredients = recipe.ingredients || []
      for (const item of ingredients) {
        const name = typeof item === 'string' ? item : item.name
        const amount = typeof item === 'string' ? '' : (item.amount || '')
        await addDoc(collection(db, 'users', user.uid, 'shoppingList'), {
          name,
          amount,
          recipeId: params.id,
          recipeName: recipe.title,
          registerToPantry: true,
          category: '',
          checked: false,
          addedAt: serverTimestamp(),
        })
      }
      setShowShoppingModal(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    } catch (err) {
      alert('追加に失敗しました')
    } finally {
      setAddingToShopping(false)
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
            <li key={i} style={{ fontSize: '14px', color: '#5C3D2E', padding: '6px 0', borderBottom: '1px solid #F5EDE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#E8A87C', fontWeight: '600' }}>・</span>
                {typeof item === 'string' ? item : item.name}
              </span>
              {typeof item !== 'string' && item.amount && (
                <span style={{ color: '#9A7060', flexShrink: 0 }}>{item.amount}</span>
              )}
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
        {user ? (
          <button onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: liked ? '#FFE4E4' : '#F5EDE6', color: liked ? '#E07070' : '#9A7060', fontSize: '14px', fontWeight: '500' }}>
            ❤ {liked ? 'やめる' : '好き！'} {recipe.likes || 0}
          </button>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '20px', backgroundColor: '#F5EDE6', color: '#9A7060', fontSize: '14px', fontWeight: '500' }}>
            ❤ {recipe.likes || 0}
          </span>
        )}
        <a href={'/recipes/new?originId=' + params.id}
          style={{ display: 'inline-block', padding: '8px 18px', borderRadius: '20px', backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '14px', fontWeight: '500', textDecoration: 'none', border: '1px solid #F0E6DC' }}>
          アレンジする
        </a>
        {user && (
          <button onClick={() => setShowShoppingModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '20px', backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '14px', fontWeight: '500', border: '1px solid #F0E6DC', cursor: 'pointer' }}>
            🛒 買い物リストに追加
          </button>
        )}
      </div>

     {arranges.length > 0 && (
        <div style={{ marginTop: '0px', paddingTop: '24px', borderTop: '1px solid #F0E6DC' }}>
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
        
<CommentSection recipeId={params.id} />
        
      {user && recipe.authorId && user.uid === recipe.authorId && (
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
      )}

      <div style={{ marginTop: '24px' }}>
        <a href="/" style={{ color: '#C07048', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
          ← 一覧に戻る
        </a>
      </div>

      {showShoppingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: '600', color: '#3D2314', marginBottom: '4px', fontSize: '16px' }}>🛒 買い物リストに追加</h3>
            <p style={{ fontSize: '13px', color: '#9A7060', marginBottom: '16px' }}>「{recipe.title}」の材料（{recipe.ingredients?.length || 0}件）</p>
            <ul style={{ listStyle: 'none', padding: 0, overflowY: 'auto', flex: 1, marginBottom: '16px' }}>
              {recipe.ingredients?.map((item, i) => {
                const name = typeof item === 'string' ? item : item.name
                const amount = typeof item === 'string' ? '' : (item.amount || '')
                const status = getPantryStatus(name)
                return (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F5EDE6', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {status === '在庫あり' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5a9e3a', flexShrink: 0, display: 'inline-block' }} />}
                      {status === '残り少ない' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e6a817', flexShrink: 0, display: 'inline-block' }} />}
                      {!status && <span style={{ width: '8px', height: '8px', flexShrink: 0, display: 'inline-block' }} />}
                      <span style={{ color: '#3D2314' }}>{name}</span>
                    </span>
                    <span style={{ color: '#9A7060', fontSize: '13px' }}>{amount}</span>
                  </li>
                )
              })}
            </ul>
            <div style={{ fontSize: '12px', color: '#B09080', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5a9e3a', display: 'inline-block' }} />在庫あり</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e6a817', display: 'inline-block' }} />残り少ない</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowShoppingModal(false)}
                style={{ flex: 1, backgroundColor: '#F5EDE6', color: '#5C3D2E', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                キャンセル
              </button>
              <button onClick={handleAddToShopping} disabled={addingToShopping}
                style={{ flex: 1, backgroundColor: '#C07048', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {addingToShopping ? '追加中...' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3D2314', color: '#fff', borderRadius: '12px', padding: '12px 20px', fontSize: '14px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <span>🛒 買い物リストに追加しました</span>
          <a href="https://pantry-app-lake-three.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ color: '#E8A87C', fontWeight: '600', textDecoration: 'none', fontSize: '13px' }}>
            もぐポケを開く →
          </a>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '320px' }}>
            <h3 style={{ fontWeight: '600', color: '#3D2314', marginBottom: '8px' }}>レシピを削除しますか？</h3>
            <p style={{ fontSize: '13px', color: '#9A7060', marginBottom: '16px' }}>この操作は取り消せません</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteModal(false)}
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
