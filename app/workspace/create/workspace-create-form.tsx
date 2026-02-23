'use client'

import { useState } from 'react'
import { createWorkspaceAction } from '../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface WorkspaceCreateFormProps {
    userId: string
}

export default function WorkspaceCreateForm({ userId }: WorkspaceCreateFormProps) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        setError('')
        try {
            const result = await createWorkspaceAction({ name, ownerId: userId })
            if (result.success && result.workspace) {
                router.push(`/workspace/${result.workspace.id}`)
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-indigo-50 to-purple-50">
                <h2 className="text-lg font-bold text-slate-900">ข้อมูล Workspace</h2>
                <p className="text-sm text-slate-500 mt-0.5">กรอกชื่อ Workspace เพื่อเริ่มต้น</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="workspace-name" className="text-sm font-medium text-slate-700">
                        ชื่อ Workspace
                    </label>
                    <input
                        id="workspace-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="เช่น My Team, Marketing"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800"
                        required
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/workspace"
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังสร้าง...
                            </span>
                        ) : 'สร้าง Workspace'}
                    </button>
                </div>
            </form>
        </div>
    )
}
