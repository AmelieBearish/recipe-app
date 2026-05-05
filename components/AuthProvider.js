'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../lib/auth'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
