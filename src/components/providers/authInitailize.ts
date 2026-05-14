'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-config'
import { useAuthStore } from '@/store/authStore'

/**
 * AuthInitializer — เป็น invisible component ที่วางใน RootLayout
 * หน้าที่: ฟัง Firebase Auth state และ sync เข้า Zustand store
 * รองรับ: การ Login/Logout ในทุก Tab และ Session restore เมื่อ refresh
 */
export default function AuthInitializer() {
    const setUser = useAuthStore((state) => state.setUser)
    const clearAuth = useAuthStore((state) => state.clearAuth)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Set session cookie ให้ Middleware และ Server Components อ่านได้
                document.cookie = `firebase-uid=${firebaseUser.uid}; path=/; max-age=86400; SameSite=Lax`

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email ?? '',
                    name: firebaseUser.displayName ?? '',
                    image: firebaseUser.photoURL ?? '',
                })
            } else {
                // ล้าง session cookie เมื่อ logout
                document.cookie = 'firebase-uid=; path=/; max-age=0'
                clearAuth()
            }
        })

        // Cleanup listener เมื่อ component unmount
        return () => unsubscribe()
    }, [setUser, clearAuth])

    return null
}