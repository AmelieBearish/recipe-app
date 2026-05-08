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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#C07048" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      好き！
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
