'use client' // แนะนำให้ใช้ Client Component สำหรับหน้า Form เพื่อจัดการ UI State

import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Mini-Jira</h1>
                    <p className="text-slate-500 mt-2">จัดการโปรเจกต์ของคุณให้เป็นเรื่องง่าย</p>
                </div>

                <form className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 block">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700 block">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200"
                        >
                            Log in
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">หรือ</span></div>
                        </div>

                        <button
                            formAction={signup}
                            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-lg border border-slate-200 transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-slate-400 mt-8">
                    การเข้าสู่ระบบแสดงว่าคุณยอมรับข้อตกลงการใช้งาน
                </p>
            </div>
        </div>
    )
}