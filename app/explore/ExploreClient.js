'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RecipeCard from '@/components/RecipeCard';
import SearchFilter from '@/components/SearchFilter';
import { CATEGORIES } from '@/lib/categories';

export default function ExploreClient() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setRecipes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRecipes();
  }, []);

  const filtered = recipes.filter((recipe) => {
    const matchesCategory = selectedCategory
      ? recipe.category === selectedCategory
      : true;
    if (!searchQuery.trim()) return matchesCategory;
    const keywords = searchQuery.trim().split(/\s+/);
    const target = [
      recipe.title,
      recipe.description,
      ...(recipe.ingredients || []).map((i) => i.name),
    ]
      .join(' ')
      .toLowerCase();
    return matchesCategory && keywords.every((kw) => target.includes(kw.toLowerCase()));
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-[#5C4A32] mb-4">探す</h1>
      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={CATEGORIES}
      />
      {filtered.length === 0 ? (
        <p className="text-center text-[#A89880] mt-12">レシピが見つかりませんでした</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}
