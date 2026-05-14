'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { collection, onSnapshot, orderBy, query, getDocs } from 'firebase/firestore'
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
  const [pantryItems, setPantryItems] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [pantrySearchMode, setPantrySearchMode] = useState(false)
  const [allPantrySearchMode, setAllPantrySearchMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      setPantryItems([])
      return
    }
    const fetchPantry = async () => {
      const snapshot = await getDocs(collection(db, `users/${user.uid}/pantry`))
      const EXCLUDED_CATEGORIES = ['調味料', '冷凍食品', 'その他']
      const items = snapshot.docs
        .map(doc => doc.data())
        .filter(item =>
          (item.status === '在庫あり' || item.status === '残り少ない') &&
          !EXCLUDED_CATEGORIES.includes(item.category)
        )
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'))
      setPantryItems(items)
    }
    fetchPantry()
  }, [user])

  const toggleIngredient = (name) => {
    setSelectedIngredients(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

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
    let result = recipes.filter(recipe => {
      const categoryMatch = selectedCategory === '' || recipe.category === selectedCategory
      const ingredientsText = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name).join(' ')
        : ''
      const searchTarget = [recipe.title, recipe.description, ingredientsText].filter(Boolean).join(' ')
      const keywordsMatch = keywords.every(kw =>
        searchTarget.toLowerCase().includes(kw.toLowerCase())
      )
      return categoryMatch && keywordsMatch
    })

    if (pantrySearchMode && selectedIngredients.length > 0) {
      result = result
        .map(recipe => {
          const recipeIngredientNames = Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name)
            : []
          const hitCount = selectedIngredients.filter(sel =>
            recipeIngredientNames.some(name => name.includes(sel) || sel.includes(name))
          ).length
          return { ...recipe, hitCount }
        })
        .filter(recipe => recipe.hitCount > 0)
        .sort((a, b) => b.hitCount - a.hitCount)
    }

    if (allPantrySearchMode && pantryItems.length > 0) {
      const pantryNames = pantryItems.map(item => item.name)
      result = result
        .map(recipe => {
          const recipeIngredientNames = Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name)
            : []
          const totalCount = recipeIngredientNames.length
          const hitCount = recipeIngredientNames.filter(name =>
            pantryNames.some(p => name.includes(p) || p.includes(name))
          ).length
          const missingCount = totalCount - hitCount
          const missingIngredients = recipeIngredientNames.filter(name =>
            !pantryNames.some(p => name.includes(p) || p.includes(name))
          )
          let pantryBadge = null
          if (missingCount === 0) pantryBadge = 'all'
          else if (missingCount === 1) pantryBadge = 'one'
          else if (missingCount === 2) pantryBadge = 'two'
          return { ...recipe, hitCount, totalCount, missingCount, missingIngredients, pantryBadge }
        })
        .filter(recipe => recipe.hitCount > 0)
        .sort((a, b) => {
          if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount
          return b.hitCount - a.hitCount
        })
    }

    return result
  }, [recipes, searchText, selectedCategory, pantrySearchMode, selectedIngredients, allPantrySearchMode, pantryItems])

  return (
    <div>
      <SearchFilter
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {user && pantryItems.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '10px 12px', backgroundColor: '#FFFAF7', border: '1px solid #F0E6DC', borderRadius: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#3D2314', marginBottom: '8px' }}>🧊 もぐポケから探す</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {pantryItems.map(item => (
              <button
                key={item.name}
                onClick={() => toggleIngredient(item.name)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedIngredients.includes(item.name) ? '#C07048' : '#F0E6DC',
                  backgroundColor: selectedIngredients.includes(item.name) ? '#C07048' : '#fff',
                  color: selectedIngredients.includes(item.name) ? '#fff' : '#9A7060',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: selectedIngredients.includes(item.name) ? '600' : '400',
                }}
              >
                {item.status === '残り少ない' ? `⚠️ ${item.name}` : item.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPantrySearchMode(true)}
              disabled={selectedIngredients.length === 0}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                backgroundColor: selectedIngredients.length > 0 ? '#C07048' : '#E8D5C8',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: selectedIngredients.length > 0 ? 'pointer' : 'default',
              }}
            >
              🔍 これで探す
            </button>
            <button
              onClick={() => setAllPantrySearchMode(true)}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                backgroundColor: '#4A8A2A',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✨ 全部使って探す
            </button>
            {(pantrySearchMode || allPantrySearchMode) && (
              <button
                onClick={() => { setPantrySearchMode(false); setAllPantrySearchMode(false); setSelectedIngredients([]) }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  backgroundColor: '#fff',
                  color: '#9A7060',
                  fontSize: '12px',
                  border: '1px solid #F0E6DC',
                  cursor: 'pointer',
                }}
              >
                クリア
              </button>
            )}
          </div>
          {(pantrySearchMode && selectedIngredients.length > 0 || allPantrySearchMode) && (
            <p style={{ fontSize: '12px', color: '#9A7060', marginTop: '8px' }}>
              {filteredRecipes.length}件のレシピが見つかりました
            </p>
          )}
        </div>
      )}
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
                <button
                  onClick={(e) => { e.stopPropagation(); pickRandom() }}
                  className="text-xs text-amber-600 border border-amber-300 rounded-full px-3 py-1 bg-white hover:bg-amber-50 transition flex-shrink-0"
                >
                  🔀 別のレシピ！
                </button>
              </div>
            </div>
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
          <RecipeCard key={recipe.id} recipe={recipe} badge={allPantrySearchMode ? recipe.pantryBadge : null} missingIngredients={allPantrySearchMode ? recipe.missingIngredients : null} />
        ))}
      </div>
    </div>
  )
}
