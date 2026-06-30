import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { buildRegistrationProfile } from '../utils/roles'

const AuthContext = createContext(null)

async function createUserDocument(uid, userData) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    ...userData,
    createdAt: serverTimestamp(),
  })
}

async function ensureGoogleUserDocument(user) {
  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    const profile = buildRegistrationProfile(user.email, 'customer')
    await createUserDocument(user.uid, {
      name: user.displayName || 'მომხმარებელი',
      email: user.email,
      role: profile.role,
      developerRequestStatus: profile.developerRequestStatus,
      companyName: '',
      phone: '',
    })
  }
}

function assertFirebase() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase არ არის კონფიგურირებული. შეავსე .env ფაილი.')
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured && !!auth)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser && db) {
        try {
          const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid))
          setUserProfile(snapshot.exists() ? snapshot.data() : null)
        } catch {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email, password, name, accountType = 'customer', extra = {}) => {
    assertFirebase()
    const profile = buildRegistrationProfile(email, accountType)
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name.trim() })

    const userData = {
      name: name.trim(),
      email: credential.user.email,
      role: profile.role,
      developerRequestStatus: profile.developerRequestStatus,
      companyName: '',
      phone: '',
    }

    if (profile.pendingDeveloper) {
      userData.developerRequestedAt = serverTimestamp()
      userData.bio = extra.bio?.trim() || ''
      userData.experienceCategories = extra.experienceCategories || []
      userData.experienceYears = extra.experienceYears || ''
      userData.ratingAvg = 0
      userData.ratingCount = 0
      userData.ratingSum = 0
    }

    await createUserDocument(credential.user.uid, userData)

    setUserProfile({
      uid: credential.user.uid,
      ...userData,
    })

    return {
      user: credential.user,
      pendingDeveloper: profile.pendingDeveloper,
    }
  }

  const login = async (email, password) => {
    assertFirebase()
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  const loginWithGoogle = async () => {
    assertFirebase()
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)
    await ensureGoogleUserDocument(credential.user)

    const snapshot = await getDoc(doc(db, 'users', credential.user.uid))
    setUserProfile(snapshot.exists() ? snapshot.data() : null)

    return credential.user
  }

  const logout = async () => {
    setUser(null)
    setUserProfile(null)

    if (!isFirebaseConfigured || !auth) {
      return
    }

    await signOut(auth)
  }

  const refreshUserProfile = async () => {
    if (!auth?.currentUser || !db) return null
    const snapshot = await getDoc(doc(db, 'users', auth.currentUser.uid))
    const profile = snapshot.exists() ? snapshot.data() : null
    setUserProfile(profile)
    return profile
  }

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      isFirebaseConfigured,
      signup,
      login,
      loginWithGoogle,
      logout,
      refreshUserProfile,
    }),
    [user, userProfile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
