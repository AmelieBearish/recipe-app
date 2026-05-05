import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { app } from './firebase'

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider)
  } catch (e) {
    if (e.code !== 'auth/popup-blocked' && e.code !== 'auth/cancelled-popup-request') {
      throw e
    }
  }
}
export const signOutUser = () => signOut(auth)
