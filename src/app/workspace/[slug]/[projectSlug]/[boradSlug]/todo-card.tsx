'use client'

import { useState } from 'react'
import { updateTodoStatusAction, deleteTodoAction } from './actions'
import { useRouter } from 'next/navigation'

interface Todo {
    id: string
    title: string
    description: string
    status: string
}

interface TodoCardProps {
    todo: Todo
    boardId: string
    onEdit: (todo: Todo) => void
}

const statusOptions: { value: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string }[] = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
]

export default function TodoCard({ todo, boardId, onEdit }: TodoCardProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    async function handleStatusChange(newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') {
        if (newStatus === todo.status) return
        setLoading(true)
        try {
            await updateTodoStatusAction({ id: todo.id, status: newStatus, boardId })
            router.refresh()
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('ยืนยันการลบงานนี้?')) return
        setLoading(true)
        try {
            await deleteTodoAction({ id: todo.id, boardId })
            router.refresh()
        } catch (error) {
            console.error('Failed to delete todo:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Title */}
            <h4 className="font-semibold text-slate-800 text-sm mb-1.5">{todo.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{todo.description}</p>

            {/* Move Buttons */}
            <div className="flex items-center gap-1 mb-3">
                {statusOptions
                    .filter((s) => s.value !== todo.status)
                    .map((s) => (
                        <button
                            key={s.value}
                            onClick={() => handleStatusChange(s.value)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                        >
                            → {s.label}
                        </button>
                    ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(todo)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="แก้ไข"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
