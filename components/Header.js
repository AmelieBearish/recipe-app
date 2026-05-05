'use client'
import { useAuth } from './AuthProvider'
import { signInWithGoogle, signOutUser } from '../lib/auth'

export default function Header() {
  const { user } = useAuth()

  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #F0E6DC', padding: '16px 20px 12px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}>
        <a href="/" style={{ display: 'block', textAlign: 'center' }}>
          <img src="/logo.png" alt="もぐレピ" style={{ height: '100px', width: 'auto', display: 'inline-block' }} />
        </a>
        <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
          {user === undefined ? null : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={user.photoURL} alt={user.displayName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <button onClick={signOutUser}
                style={{ backgroundColor: '#F5EDE6', color: '#5C3D2E', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                ログアウト
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle}
              style={{ backgroundColor: '#C07048', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              ログイン
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
