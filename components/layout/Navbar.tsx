"use client";

import { useAuthStore } from "@/store/authStore";
import { logout } from "@/app/login/actions";
import Link from "next/link";
import { useTransition, useState } from "react";

export default function Navbar() {
    const { user, clearAuth } = useAuthStore();
    const [isPending, startTransition] = useTransition();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        clearAuth()
        startTransition(async () => {
            await logout()
        })
    }

    return (
        <nav className="glass border-b border-slate-200/80 sticky top-0 z-40">
            <div className="app-container flex items-center justify-between h-14 sm:h-16">
                {/* Logo */}
                <Link href={user ? "/workspace" : "/"} className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200/50">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Mini Jira</span>
                </Link>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm text-slate-500 hidden md:block">{user.email}</span>
                            <Link
                                href="/account"
                                className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200/50 ring-2 ring-white hover:ring-indigo-100 transition-all"
                            >
                                {user.email?.charAt(0).toUpperCase()}
                            </Link>
                            <button
                                disabled={isPending}
                                onClick={handleLogout}
                                className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                {isPending ? 'กำลังออก...' : 'ออกจากระบบ'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                เข้าสู่ระบบ
                            </Link>
                            <Link
                                href="/signup"
                                className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200/50"
                            >
                                สมัครสมาชิก
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {mobileMenuOpen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg">
                    <div className="app-container py-4 space-y-3">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-slate-600 truncate">{user.email}</span>
                                </div>
                                <Link href="/account" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                                    บัญชีของฉัน
                                </Link>
                                <button
                                    disabled={isPending}
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                                    เข้าสู่ระบบ
                                </Link>
                                <Link href="/signup" className="block px-3 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                                    สมัครสมาชิก
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
