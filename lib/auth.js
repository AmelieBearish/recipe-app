import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { app } from './firebase'
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, provider)
  } catch (err) {
    if (err.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, provider)
    }
    throw err
  }
}
export const signOutUser = () => signOut(auth)
