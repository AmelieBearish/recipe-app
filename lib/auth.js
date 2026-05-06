import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { app } from './firebase'
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider)
  } catch (e) {
    if (e.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
    } else {
      throw e
    }
  }
}
export const signOutUser = () => signOut(auth)
