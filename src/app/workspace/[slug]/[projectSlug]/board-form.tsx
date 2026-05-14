'use client'

import { useState } from 'react'
import { createBoardAction } from './actions'
import { useRouter } from 'next/navigation'

import { Palette, Layout, Info, type LucideIcon } from 'lucide-react'
import { IBoard } from '@/lib/types'

// รายการสีแนะนำสำหรับ Board บน Canvas
const PRESET_COLORS = [
    { name: 'Slate', value: '#64748b' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Sky', value: '#0ea5e9' },
]

interface BoardFormProps {
    workspaceId: string
    projectId: string
    board?: Partial<IBoard> | null // ใช้สำหรับกรณี Edit
    onClose: () => void
}

export default function BoardForm({ workspaceId, projectId, board, onClose }: BoardFormProps) {
    const router = useRouter()
    const isEditing = !!board

    // States ตาม Model ใหม่
    const [title, setTitle] = useState(board?.title || '')
    const [description, setDescription] = useState(board?.description || '')
    const [color, setColor] = useState(board?.color || '#6366f1') // Default เป็น Indigo

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        try {
            const payload = {
                title,
                description,
                color,
                projectId,
                workspaceId,
                // สำหรับบอร์ดใหม่ อาจจะกำหนดตำแหน่งเริ่มต้น (หรือให้ Server จัดการ)
                positionX: board?.positionX ?? 0,
                positionY: board?.positionY ?? 0,
            }

            await createBoardAction(payload)

            router.refresh()
            onClose()
        } catch (error) {
            console.error('Failed to save board:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">

                {/* Header: ใช้สีที่เลือกมาทำเป็นแถบสถานะด้านบน */}
                <div
                    className="h-2 transition-colors duration-300"
                    style={{ backgroundColor: color }}
                />

                <div className="px-8 py-6 border-b border-slate-50 bg-linear-to-b from-slate-50/50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100">
                            <Layout size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditing ? 'แก้ไขบอร์ด' : 'สร้างบอร์ดใหม่'}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">บอร์ดจะแสดงผลเป็น Node บน Canvas</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* ชื่อบอร์ด */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">ชื่อบอร์ด</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น Sprint Backlog, Phase 1"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all"
                            required
                            autoFocus
                        />
                    </div>

                    {/* รายละเอียด */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">รายละเอียด (Description)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="บอร์ดนี้ใช้สำหรับจัดการส่วนไหน..."
                            rows={2}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all resize-none"
                        />
                    </div>

                    {/* เลือกสี (New Field) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Palette size={16} /> สีประจำบอร์ด
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value
                                        ? 'border-slate-900 scale-110 shadow-md'
                                        : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                            {/* Custom Color Input */}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างบอร์ด'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}