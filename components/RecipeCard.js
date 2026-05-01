'use client'

export default function RecipeCard({ recipe }) {
  return (
    <a href={`/recipes/${recipe.id}`} className="block bg-white rounded-xl shadow hover:shadow-md transition p-4">
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          {recipe.category}
        </span>
        <span className="text-xs text-gray-400">{recipe.cookTime}分</span>
      </div>
      <h2 className="font-bold text-lg text-gray-800">{recipe.title}</h2>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
      <div className="flex items-center mt-3 text-sm text-gray-400">
        <span>❤ {recipe.likes || 0}</span>
        <span className="mx-2">·</span>
        <span>💬 {recipe.commentCount || 0}</span>
      </div>
    </a>
  )
}
