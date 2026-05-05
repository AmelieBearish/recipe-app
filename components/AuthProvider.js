'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../lib/auth'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      console.log('redirectResult:', result)
    }).catch((e) => {
      console.log('redirectError:', e)
    })
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('authStateChanged:', user)
      setUser(user)
    })
    return () => unsubscribe()
  }, [])
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  return useContext(AuthContext)
}
