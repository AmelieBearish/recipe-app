'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../components/AuthProvider'
import RecipeCard from '../components/RecipeCard'
import SearchFilter from '../components/SearchFilter'

export default function Home() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [featuredRecipe, setFeaturedRecipe] = useState(null)
  const router = useRouter()

  const mainRecipes = useMemo(() => recipes.filter(r => r.category === '主菜'), [recipes])
  
  const pickRandom = useCallback(() => {
    if (mainRecipes.length === 0) return
    const idx = Math.floor(Math.random() * mainRecipes.length)
    setFeaturedRecipe(mainRecipes[idx])
  }, [mainRecipes])

  useEffect(() => {
    if (!loading && featuredRecipe === null) pickRandom()
  }, [loading, featuredRecipe, pickRandom])

  useEffect(() => {
    document.title = 'もぐレピ - レシピ一覧'
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredRecipes = useMemo(() => {
    const keywords = searchText.trim().split(/\s+/).filter(Boolean)
    return recipes.filter(recipe => {
      const categoryMatch = selectedCategory === '' || recipe.category === selectedCategory
      const ingredientsText = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(' ') : ''
      const searchTarget = [recipe.title, recipe.description, ingredientsText].filter(Boolean).join(' ')
      const keywordsMatch = keywords.every(kw =>
        searchTarget.toLowerCase().includes(kw.toLowerCase())
      )
      return categoryMatch && keywordsMatch
    })
  }, [recipes, searchText, selectedCategory])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">レシピ一覧</h1>
      </div>
     <SearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {!loading && featuredRecipe && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex items-stretch cursor-pointer" onClick={() => router.push(`/recipes/${featuredRecipe.id}`)}>
            <div className="w-28 h-28 flex-shrink-0 relative bg-amber-100 m-3 rounded-xl overflow-hidden">
              {featuredRecipe.imageUrl ? (
                <Image src={featuredRecipe.imageUrl} alt={featuredRecipe.title} fill className="object-cover" />
              ) : (
                <Image src="/images/categories/main.png" alt="主菜" fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col justify-center px-4 py-3 flex-1 min-w-0">
              <span className="text-xs font-bold text-amber-600 mb-1">こんなの好き？</span>
              <p className="font-bold text-gray-800 text-base leading-snug line-clamp-1">{featuredRecipe.title}</p>
              {featuredRecipe.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{featuredRecipe.description}</p>
              )}
              {Array.isArray(featuredRecipe.ingredients) && featuredRecipe.ingredients.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {featuredRecipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name).join('・')}
                </p>
              )}
            </div>
          </div>
          <div className="px-4 pb-3 pt-1 flex justify-end">
            <button
              onClick={pickRandom}
              className="text-xs text-amber-600 border border-amber-300 rounded-full px-3 py-1 bg-white hover:bg-amber-50 transition"
            >
              🔀 ランダム表示
            </button>
          </div>
        </div>
      )}
      {loading && <p className="text-gray-400 text-sm">読み込み中...</p>}
      {!loading && filteredRecipes.length === 0 && (
        <p className="text-gray-400 text-sm">
          {recipes.length === 0 ? 'まだレシピがありません。最初のレシピを追加してみましょう！' : '条件に一致するレシピが見つかりませんでした。'}
        </p>
      )}
      <div className="grid gap-4">
        {filteredRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
