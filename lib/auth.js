import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth'
import { app } from './firebase'

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithRedirect(auth, provider)
export const signOutUser = () => signOut(auth)
