import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'

// いいね状態を確認
export async function checkLiked(uid, recipeId) {
  const ref = doc(db, 'favorites', uid, 'recipes', recipeId)
  const snap = await getDoc(ref)
  return snap.exists()
}

// いいね追加
export async function addLike(uid, recipe) {
  const ref = doc(db, 'favorites', uid, 'recipes', recipe.id)
  await setDoc(ref, {
    recipeId: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl || null,
    category: recipe.category || null,
    likedAt: new Date()
  })
}

// いいね削除
export async function removeLike(uid, recipeId) {
  const ref = doc(db, 'favorites', uid, 'recipes', recipeId)
  await deleteDoc(ref)
}

// お気に入り一覧取得
export async function getFavorites(uid) {
  const ref = collection(db, 'favorites', uid, 'recipes')
  const q = query(ref, orderBy('likedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}
