'use client'
import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { signInWithGoogle, signOutUser } from '../lib/auth'
export default function Header() {
  const { user } = useAuth()
  const [popupBlocked, setPopupBlocked] = useState(false)
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
        <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
          {user === undefined ? null : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={signOutUser}
                style={{ backgroundColor: '#F5EDE6', color: '#5C3D2E', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                ログアウト
              </button>
            </div>
          ) : (
            <div>
              <button onClick={handleLogin}
                style={{ backgroundColor: '#C07048', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                ログイン
              </button>
              {popupBlocked && (
                <p style={{ fontSize: '11px', color: '#C07048', marginTop: '4px', textAlign: 'right' }}>
                  ポップアップを許可してください
                </p>
              )}
            </div>
      </div>
    </header>
  )
}
