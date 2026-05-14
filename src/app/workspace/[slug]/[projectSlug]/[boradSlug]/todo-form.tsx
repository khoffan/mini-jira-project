'use client'

import { useState } from 'react'
import { createTodoAction, updateTodoAction } from './actions'
import { useRouter } from 'next/navigation'
import { Calendar, Flag, AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react'
import { Priority, type ITask, TaskStatus } from '@/lib/types'

interface TodoFormProps {
    boardId: string
    todo?: Partial<ITask> | null
    onClose: () => void
}

export default function TodoForm({ boardId, todo, onClose }: TodoFormProps) {
    const router = useRouter()
    const isEditing = !!todo

    // States ตาม Model ใหม่
    const [title, setTitle] = useState(todo?.title || '')
    const [description, setDescription] = useState(todo?.description || '')
    const [status, setStatus] = useState<TaskStatus>(todo?.status || 'TODO')
    const [priority, setPriority] = useState<Priority>(todo?.priority || 'MEDIUM')
    const [dueDate, setDueDate] = useState(todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '')

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        try {
            const payload = {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                boardId
            }

            if (isEditing && todo?.id) {
                await updateTodoAction({ id: todo.id, ...payload })
            } else {
                await createTodoAction(payload)
            }

            router.refresh()
            onClose()
        } catch (error) {
            console.error('Failed to save todo:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 bg-linear-to-r from-blue-50/50 to-indigo-50/50">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        {isEditing ? 'แก้ไขรายละเอียดงาน' : 'สร้างงานใหม่'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">จัดการงานของคุณให้เป็นระบบด้วยพารามิเตอร์ที่ชัดเจน</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">หัวข้องาน</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น ออกแบบหน้า Dashboard"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                            required
                        />
                    </div>

                    {/* Status & Priority (Two Columns) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">สถานะ</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {['TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">ความสำคัญ</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1">
                            <Clock size={12} /> กำหนดส่ง (Due Date)
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">รายละเอียด</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="ระบุรายละเอียดเพิ่มเติมของงานนี้..."
                            rows={3}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                        >
                            {loading ? 'กำลังประมวลผล...' : isEditing ? 'อัปเดตงาน' : 'สร้างงาน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}