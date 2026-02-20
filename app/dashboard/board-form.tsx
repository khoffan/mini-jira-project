'use client'

import { useState } from 'react'
import { createBoardAction, updateBoardAction } from './actions'
import { useRouter } from 'next/navigation'

interface Board {
    id: string
    title: string
    description: string
}

interface BoardFormProps {
    userId: string
    board?: Board | null
    onClose: () => void
}

export default function BoardForm({ userId, board, onClose }: BoardFormProps) {
    const router = useRouter()
    const isEditing = !!board
    const [title, setTitle] = useState(board?.title || '')
    const [description, setDescription] = useState(board?.description || '')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        try {
            if (isEditing && board) {
                await updateBoardAction({ id: board.id, title, description })
            } else {
                await createBoardAction({ title, description, userId })
            }
            router.refresh()
            onClose()
        } catch (error) {
            console.error('Failed to save board:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditing ? 'แก้ไขบอร์ด' : 'สร้างบอร์ดใหม่'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isEditing ? 'อัปเดตข้อมูลบอร์ดของคุณ' : 'กรอกข้อมูลเพื่อสร้างบอร์ดใหม่'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="board-title" className="text-sm font-medium text-slate-700">
                            ชื่อบอร์ด
                        </label>
                        <input
                            id="board-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น Sprint #1, Marketing Plan"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="board-description" className="text-sm font-medium text-slate-700">
                            รายละเอียด
                        </label>
                        <textarea
                            id="board-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="อธิบายจุดประสงค์ของบอร์ดนี้..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-800"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    กำลังบันทึก...
                                </span>
                            ) : isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างบอร์ด'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
