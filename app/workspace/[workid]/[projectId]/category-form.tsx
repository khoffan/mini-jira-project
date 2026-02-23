'use client'

import { useState } from 'react'
import { createCategoryAction, updateCategoryAction } from './actions'
import { useRouter } from 'next/navigation'

interface Category {
    id: string
    name: string
    color: string
}

interface CategoryFormProps {
    workspaceId: string
    projectId: string
    category?: Category | null
    onClose: () => void
}

const COLORS = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Yellow', value: '#EAB308' },
]

export default function CategoryForm({ workspaceId, projectId, category, onClose }: CategoryFormProps) {
    const router = useRouter()
    const isEditing = !!category
    const [name, setName] = useState(category?.name || '')
    const [color, setColor] = useState(category?.color || COLORS[0].value)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            if (isEditing && category) {
                await updateCategoryAction({ id: category.id, name, color, workspaceId, projectId })
            } else {
                await createCategoryAction({ name, color, projectId, workspaceId })
            }
            router.refresh()
            onClose()
        } catch (error) {
            console.error('Failed to save category:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
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
                        <label htmlFor="category-name" className="text-sm font-medium text-slate-700">
                            ชื่อบอร์ด
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น Sprint Backlog, Bug Fixes"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            สี
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
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
                            disabled={loading || !name.trim()}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
