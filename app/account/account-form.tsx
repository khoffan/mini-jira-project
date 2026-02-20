'use client'
import { useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { updateProfileAction } from './actions'

export default function AccountForm({ user }: { user: User | null }) {
    const [loading, setLoading] = useState(false) // เริ่มต้นเป็น false เพราะเรามีข้อมูล user จาก props แล้ว
    const [fullname, setFullname] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [website, setWebsite] = useState<string | null>(null)
    const [avatar_url, setAvatarUrl] = useState<string | null>(null)
    console.log("user", user)
    async function handleUpdate() {
        try {
            setLoading(true)
            await updateProfileAction({
                userId: user?.id as string,
                fullname,
                username,
                website,
                avatar_url,
            })
            alert('Profile updated successfully!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Header Section */}
            <div className="mb-8 border-b border-slate-200 pb-6">
                <h1 className="text-2xl font-bold text-slate-900">จัดการบัญชีผู้ใช้</h1>
                <p className="text-slate-500">แก้ไขข้อมูลส่วนตัวและการตั้งค่าโปรไฟล์ของคุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Instructions or Profile Picture Preview */}
                <div className="md:col-span-1">
                    <h2 className="text-lg font-semibold text-slate-800">ข้อมูลส่วนตัว</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        ชื่อและข้อมูลนี้จะปรากฏให้คนอื่นเห็นเมื่อคุณทำงานร่วมกันในบอร์ด
                    </p>
                </div>

                {/* Right Side: Form Fields */}
                <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    {/* Email (Read Only) */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">อีเมล</label>
                        <input
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                            type="text"
                            value={user?.email}
                            disabled
                        />
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                        <label htmlFor="fullName" className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                        <input
                            id="fullName"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            type="text"
                            value={fullname || ''}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="ระบุชื่อจริงของคุณ"
                        />
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                        <label htmlFor="username" className="text-sm font-medium text-slate-700">ชื่อผู้ใช้ (Username)</label>
                        <input
                            id="username"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            type="text"
                            value={username || ''}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="example_user"
                        />
                    </div>

                    {/* Website */}
                    <div className="space-y-1">
                        <label htmlFor="website" className="text-sm font-medium text-slate-700">เว็บไซต์</label>
                        <input
                            id="website"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            type="url"
                            value={website || ''}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                        <form action="/auth/signout" method="post">
                            <button
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                type="submit"
                            >
                                ออกจากระบบ
                            </button>
                        </form>

                        <button
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                            onClick={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    กำลังบันทึก...
                                </span>
                            ) : 'บันทึกการเปลี่ยนแปลง'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}