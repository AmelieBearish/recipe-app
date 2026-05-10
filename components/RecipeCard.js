'use client'
import { CATEGORIES } from '../lib/categories'
export default function RecipeCard({ recipe, badge }) {
  const categoryDefault = CATEGORIES.find(c => c.id === recipe.category)?.defaultImage
  return (
    <a href={'/recipes/' + recipe.id} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', marginBottom: '14px', overflow: 'hidden', transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,112,72,0.10)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <img
          src={recipe.imageUrl || categoryDefault || '/images/categories/other.png'}
          alt={recipe.title}
          style={{ width: '90px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', flexShrink: 0 }}>
              {recipe.category}
            </span>
            {recipe.cookTime > 0 && (
              <span style={{ fontSize: '11px', color: '#B09080', flexShrink: 0 }}>{recipe.cookTime}分</span>
            )}
            {badge === 'all' && (
              <span style={{ backgroundColor: '#E8F5E2', color: '#4A8A2A', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', flexShrink: 0 }}>🌟 全部ある！</span>
            )}
            {badge === 'one' && (
              <span style={{ backgroundColor: '#E8F5E2', color: '#4A8A2A', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', flexShrink: 0 }}>🟢 あと1個！</span>
            )}
            {badge === 'two' && (
              <span style={{ backgroundColor: '#FFF8E0', color: '#A07820', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', flexShrink: 0 }}>🟡 あと2個！</span>
            )}
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#3D2314', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recipe.title}</h2>
          <p style={{ fontSize: '12px', color: '#9A7060', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{recipe.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#E07070' }}>❤ {recipe.likes || 0}</span>
            <span style={{ fontSize: '12px', color: '#B09080' }}>💬 {recipe.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </a>
  )
}
