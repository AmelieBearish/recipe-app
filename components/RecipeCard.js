'use client'

export default function RecipeCard({ recipe }) {
  return (
    <a href={'/recipes/' + recipe.id} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', marginBottom: '14px', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,112,72,0.10)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          />
        )}
        {!recipe.imageUrl && (
          <div style={{ width: '100%', height: '100px', backgroundColor: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
            🍳
          </div>
        )}
        <div style={{ padding: '12px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
              {recipe.category}
            </span>
            <span style={{ fontSize: '11px', color: '#B09080' }}>{recipe.cookTime}分</span>
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#3D2314', marginBottom: '4px' }}>{recipe.title}</h2>
          <p style={{ fontSize: '13px', color: '#9A7060', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{recipe.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F5EDE6' }}>
            <span style={{ fontSize: '12px', color: '#E07070' }}>❤ {recipe.likes || 0}</span>
            <span style={{ fontSize: '12px', color: '#B09080' }}>💬 {recipe.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
