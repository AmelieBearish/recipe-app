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

  const targetRecipes = useMemo(() => {
    if (selectedCategory === '') return recipes
    return recipes.filter(r => r.category === selectedCategory)
  }, [recipes, selectedCategory])

  const pickRandom = useCallback(() => {
    if (targetRecipes.length === 0) return
    const idx = Math.floor(Math.random() * targetRecipes.length)
    setFeaturedRecipe(targetRecipes[idx])
  }, [targetRecipes])

  useEffect(() => {
    if (!loading) pickRandom()
  }, [loading, selectedCategory])
  
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
               <Image src={`/images/categories/${{'主菜':'main','副菜':'side','汁物':'soup','丼':'donburi','麺':'noodle','おやつ・デザート':'snack','その他':'other'}[featuredRecipe.category] || 'main'}.png`} alt={featuredRecipe.category || '主菜'} fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col justify-between px-4 py-3 flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-600">
                    {selectedCategory === '' ? (
                      {
                        '主菜': '今日のごはん、こんなのどう？',
                        '副菜': 'あと一品とか、こんなのどう？',
                        '汁物': 'お口のうるおい、こんなのどう？',
                        '丼': 'どんぶりもの、こんなのどう？',
                        '麺': 'ちゅるっと一品、こんなのどう？',
                        'おやつ・デザート': '甘いもの、こんなのどう？',
                        'その他': '仕込んでおくの、こんなのどう？',
                      }[featuredRecipe.category] ?? '✨ こんなの好き？'
                    ) : '✨ こんなの好き？'}
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-base leading-snug line-clamp-1">{featuredRecipe.title}</p>
                {featuredRecipe.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{featuredRecipe.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {Array.isArray(featuredRecipe.ingredients) && featuredRecipe.ingredients.length > 0
                    ? featuredRecipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name).join('・')
                    : ''}
                </p>
              </div>
              <div className="flex justify-end">
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
