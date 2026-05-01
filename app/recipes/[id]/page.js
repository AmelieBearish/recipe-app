'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import CommentSection from '../../../components/CommentSection'

export default function RecipeDetail({ params }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'recipes', params.id))
      if (snap.exists()) {
        setRecipe({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }
    fetch()
  }, [params.id])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setRecipe(r => ({ ...r, likes: (r.likes || 0) + 1 }))
    await updateDoc(doc(db, 'recipes', params.id), {
      likes: increment(1)
    })
  }

  if (loading) return <p className="text-gray-400 text-sm">読み込み中...</p>
  if (!recipe) return <p className="text-gray-400 text-sm">レシピが見つかりません</p>

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          {recipe.category}
        </span>
        <span className="text-xs text-gray-400">{recipe.cookTime}分</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{recipe.title}</h1>
      <p className="text-gray-600 text-sm mb-6">{recipe.description}</p>

      <div className="mb-6">
        <h2 className="font-bold text-gray-700 mb-2">材料</h2>
        <ul className="space-y-1">
          {recipe.ingredients?.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-orange-400">・</span>{item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-gray-700 mb-2">手順</h2>
        <ol className="space-y-2">
          {recipe.steps?.map((step, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <button
        onClick={handleLike}
        disabled={liked}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition ${
          liked
            ? 'bg-pink-100 text-pink-500 cursor-default'
            : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-500'
        }`}
      >
        ❤ {liked ? 'ありがとう！' : '好き！'} {recipe.likes || 0}
      </button>

      <CommentSection recipeId={params.id} />
      <div className="mt-8">
        <a href="/" className="text-orange-500 hover:text-orange-600 text-sm font-bold">
          ← 一覧に戻る
        </a>
      </div>
    </div>
  )
}
