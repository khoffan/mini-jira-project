'use client'

import { useState, useTransition } from 'react'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase-config'
import { createUserInDB } from '@/app/login/actions'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const { setUser } = useAuthStore()
    const [isSignup, setIsSignup] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isPending, startTransition] = useTransition()

    /** ─── Helper: sync Firebase user → Zustand + MongoDB ─── */
    const handleAuthSuccess = async (
        uid: string,
        userEmail: string,
        displayName?: string | null,
        photoURL?: string | null
    ) => {
        // 1. Set cookie ให้ Middleware และ Server Components อ่านได้
        document.cookie = `firebase-uid=${uid}; path=/; max-age=86400; SameSite=Lax`

        // 2. Upsert ใน MongoDB (idempotent)
        const result = await createUserInDB({
            uid,
            email: userEmail,
            name: displayName,
            image: photoURL
        })
        if (!result.success) {
            console.error("Sync to DB failed:", result.error);
            toast.error('เข้าสู่ระบบสำเร็จใน Firebase แต่บันทึกฐานข้อมูลไม่ได้')
            // ให้เขาไปต่อได้ เพราะ Firebase Auth ผ่านแล้ว
        }
        // 3. อัป Zustand store
        setUser({ uid, email: userEmail, name: displayName ?? '', image: photoURL ?? '' })

        toast.success('เข้าสู่ระบบสำเร็จ!')
        router.push('/workspace')
    }

    /** ─── Email/Password Login ─── */
    const handleEmailLogin = () => {
        if (!email || !password) return toast.error('กรุณากรอกอีเมลและรหัสผ่าน')
        startTransition(async () => {
            try {
                const result = await signInWithEmailAndPassword(auth, email, password)
                const u = result.user
                console.log(u)
                await handleAuthSuccess(u.uid, u.email!, u.displayName, u.photoURL)
            } catch (err: unknown) {
                console.error("login email error:", err)
                setUser(null)
                const message = err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ'
                toast.error(message.includes('invalid-credential') ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : message)
            }
        })
    }

    /** ─── Google Sign-In ─── */
    const handleGoogleSignIn = () => {
        startTransition(async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider)
                const u = result.user
                await handleAuthSuccess(u.uid, u.email!, u.displayName, u.photoURL)
            } catch (err: unknown) {
                console.error("register google error:", err)
                setUser(null)
                const message = err instanceof Error ? err.message : 'Google Sign-In ไม่สำเร็จ'
                if (!message.includes('popup-closed')) toast.error(message)
            }
        })
    }

    /** ─── Email/Password Signup ─── */
    const handleEmailSignup = () => {
        if (!email || !password) return toast.error('กรุณากรอกอีเมลและรหัสผ่าน')
        if (password.length < 6) return toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        startTransition(async () => {
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password)
                const u = result.user
                // อัป displayName ถ้ากรอก name มา
                if (name) await updateProfile(u, { displayName: name })
                await handleAuthSuccess(u.uid, u.email!, name || null, null)
            } catch (err: unknown) {
                console.error("register email error:", err)
                const message = err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ'
                toast.error(message.includes('email-already-in-use') ? 'อีเมลนี้ถูกใช้งานแล้ว' : message)
            }
        })
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Mini-Jira</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {isSignup ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบเพื่อจัดการโปรเจกต์ของคุณ'}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Name Field — แสดงเฉพาะตอน Signup */}
                    {isSignup && (
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-700 block">
                                ชื่อ (ไม่บังคับ)
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ชื่อของคุณ"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
                            />
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 block">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700 block">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
                        />
                    </div>

                    {/* Email Action Button */}
                    <button
                        id="btn-email-action"
                        onClick={isSignup ? handleEmailSignup : handleEmailLogin}
                        disabled={isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-200"
                    >
                        {isPending ? 'กำลังดำเนินการ...' : isSignup ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}
                    </button>

                    {/* Divider */}
                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">หรือ</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        id="btn-google-signin"
                        onClick={handleGoogleSignIn}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
                    >
                        {/* Google Logo SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Toggle Login / Signup */}
                    <p className="text-center text-sm text-slate-500">
                        {isSignup ? 'มีบัญชีอยู่แล้ว? ' : 'ยังไม่มีบัญชี? '}
                        <button
                            id="btn-toggle-mode"
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-indigo-600 font-semibold hover:underline"
                        >
                            {isSignup ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                        </button>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    การเข้าสู่ระบบแสดงว่าคุณยอมรับข้อตกลงการใช้งาน
                </p>
            </div>
        </div>
    )
}