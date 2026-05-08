'use client'
import { useState, useEffect, useMemo } from 'react'
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
