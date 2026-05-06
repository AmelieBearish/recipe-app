'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { getFavorites } from '../../lib/favorites'
import { CATEGORIES } from '../../lib/categories'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getFavorites(user.uid).then(data => {
      setFavorites(data)
      setLoading(false)
    })
  }, [user])

  if (loading) return <p style={{ color: '#9A7060', fontSize: '14px' }}>読み込み中...</p>

  if (!user) return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '32px', textAlign: 'center' }}>
      <p style={{ color: '#9A7060', fontSize: '14px' }}>ログインするとお気に入り一覧を見られます</p>
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#3D2314', marginBottom: '20px' }}>❤ お気に入り</h1>

      {favorites.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#9A7060', fontSize: '14px' }}>まだお気に入りがありません</p>
        </div>
      ) : (
        <div>
          {favorites.map(item => {
            const categoryDefault = CATEGORIES.find(c => c.id === item.category)?.defaultImage
            return (
              <a key={item.recipeId} href={'/recipes/' + item.recipeId}
                style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F0E6DC', marginBottom: '14px', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(192,112,72,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <img
                    src={item.imageUrl || categoryDefault || '/images/categories/other.png'}
                    alt={item.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ backgroundColor: '#FFF0E6', color: '#C07048', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                        {item.category}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#3D2314' }}>{item.title}</h2>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
