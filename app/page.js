'use client'
import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import RecipeCard from '../components/RecipeCard'

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">レシピ一覧</h1>
        
         <a href="/recipes/new"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
        >
          + レシピを追加
        </a>
      </div>
      {loading && <p className="text-gray-400 text-sm">読み込み中...</p>}
      {!loading && recipes.length === 0 && (
        <p className="text-gray-400 text-sm">まだレシピがありません。最初のレシピを追加してみましょう！</p>
      )}
      <div className="grid gap-4">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
