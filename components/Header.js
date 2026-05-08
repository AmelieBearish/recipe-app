'use client'
import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { signInWithGoogle, signOutUser } from '../lib/auth'
export default function Header() {
  const { user } = useAuth()
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogin = async () => {
    try {
      setPopupBlocked(false)
      await signInWithGoogle()
    } catch (e) {
      if (e.code === 'auth/popup-blocked') {
        setPopupBlocked(true)
      }
    }
  }
  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #F0E6DC', padding: '16px 20px 12px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}>
        <a href="/" style={{ display: 'block', textAlign: 'center' }}>
          <img src="/logo.png" alt="もぐレピ" style={{ height: '100px', width: 'auto', display: 'inline-block' }} />
        </a>
        <div className="hidden md:block" style={{ position: 'absolute', right: 0, bottom: 0 }}>
          {user === undefined ? null : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ backgroundColor: '#F5EDE6', color: '#5C3D2E', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '18px', cursor: 'pointer', letterSpacing: '2px' }}
              >
                •••
              </button>
              {menuOpen && (
                <>
                  <div
                    onClick={() => setMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', backgroundColor: '#fff', border: '1px solid #E8DDD0', borderRadius: '12px', overflow: 'hidden', minWidth: '150px', zIndex: 20 }}>
                    <a href="/favorites" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: '#5C3D2E', textDecoration: 'none', borderBottom: '1px solid #F0E6DC' }}>
                      ❤ 好き！
                    </a>
                    <a href="/recipes/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', color: '#5C3D2E', textDecoration: 'none', borderBottom: '1px solid #F0E6DC' }}>
                      ＋ レシピを追加
                    </a>
                    {user ? (
                      <button
                        onClick={() => { signOutUser(); setMenuOpen(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', fontSize: '13px', color: '#5C3D2E', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        ↩ ログアウト
                      </button>
                    ) : (
                      <button
                        onClick={() => { handleLogin(); setMenuOpen(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', fontSize: '13px', color: '#5C3D2E', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        → ログイン
                      </button>
                    )}
                    {popupBlocked && (
                      <p style={{ fontSize: '11px', color: '#C07048', margin: '0', padding: '0 16px 10px' }}>
                        ポップアップを許可してください
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
