"use client";

import { useAuthStore } from "@/store/authStore";
import { logout } from "@/app/login/actions";
import Link from "next/link";
import { useTransition } from "react";

export default function Navbar() {
    const { user, clearAuth } = useAuthStore();

    const [isPending, startTransition] = useTransition();

    console.log("user", user)

    const handleLogout = () => {
        clearAuth()
        startTransition(async () => {
            await logout()
        })
    }

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Mini Jira</span>
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm text-slate-500">{user.email}</span>
                            <Link
                                href="/account"
                                className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                            >
                                {user.email?.charAt(0).toUpperCase()}
                            </Link>
                            <button
                                disabled={isPending}
                                onClick={handleLogout}
                                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href="/signup"
                                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                            >
                                สมัครสมาชิก
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
