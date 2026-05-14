'use client'

import { useState } from 'react'
import { createWorkspaceAction } from '../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, Info, LinkIcon, Lock } from 'lucide-react'

interface WorkspaceCreateFormProps {
    userId: string
}

export default function WorkspaceCreateForm({ userId }: WorkspaceCreateFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // States ตาม Schema ใหม่
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        allowLinkJoin: true,
        isPublic: false
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.name.trim()) return

        setLoading(true)
        setError('')
        try {
            // ส่งค่าไปยัง Action โดยรวมฟิลด์ใหม่เข้าไปด้วย
            const result = await createWorkspaceAction({
                ...formData,
                ownerId: userId
            })

            if (result.success && result.workspace) {
                router.push(`/workspace/${result.workspace.slug}`)
            } else {
                setError(result.error || 'เกิดข้อผิดพลาด')
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการสร้าง Workspace')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden max-w-2xl mx-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-indigo-50/50 to-purple-50/50">
                <h2 className="text-xl font-bold text-slate-900">สร้าง Workspace ใหม่</h2>
                <p className="text-sm text-slate-500 mt-1">พื้นที่สำหรับจัดการโปรเจกต์และทีมของคุณ</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 1. ข้อมูลพื้นฐาน */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            ชื่อ Workspace <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="เช่น My Digital Agency, Startup Project"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">คำอธิบาย (ไม่บังคับ)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="บอกรายละเอียดสั้นๆ เกี่ยวกับ Workspace นี้..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. การตั้งค่าการเข้าถึง (New Schema Logic) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">การตั้งค่าการเข้าถึง</h3>

                    {/* Allow Link Join Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex gap-3">
                            <div className="mt-1 p-2 bg-indigo-100 text-indigo-600 rounded-lg h-fit">
                                <LinkIcon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">อนุญาตให้เข้าใช้งานผ่านลิงก์</p>
                                <p className="text-xs text-slate-500">ทุกคนที่มี Invite Code จะสามารถเข้าร่วมได้ทันที</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, allowLinkJoin: !formData.allowLinkJoin })}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.allowLinkJoin ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${formData.allowLinkJoin ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Is Public Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex gap-3">
                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.isPublic ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                                {formData.isPublic ? <Globe size={18} /> : <Lock size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Workspace สาธารณะ</p>
                                <p className="text-xs text-slate-500">กำหนดให้ Workspace นี้เป็นสาธารณะ (คนในองค์กรค้นหาเจอ)</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isPublic ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${formData.isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                        <Info size={16} />
                        {error}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/workspace"
                        className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !formData.name.trim()}
                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? 'กำลังสร้าง...' : 'เริ่มสร้าง Workspace'}
                    </button>
                </div>
            </form>
        </div>
    )
}
