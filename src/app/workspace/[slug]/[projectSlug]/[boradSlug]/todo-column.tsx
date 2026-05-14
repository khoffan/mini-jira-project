'use client'

import { useState } from 'react'
import TodoCard from './todo-card'
import TodoForm from './todo-form'
import type { ITask } from '@/lib/types'
import { Kanban, Layout, MoreHorizontal, MoreVertical, Plus } from 'lucide-react'

interface TodoColumnProps {
    title: string
    status: string
    todos: ITask[]
    boardId: string
    color: string
    icon: React.ReactNode
}

export default function TodoColumn({ title, status, todos, boardId, color, icon }: TodoColumnProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingTodo, setEditingTodo] = useState<ITask | null>(null)

    function handleEdit(todo: ITask) {
        setEditingTodo(todo)
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
        setEditingTodo(null)
    }

    return (
        <div className="flex flex-col bg-slate-100/50 rounded-[28px] border border-slate-200/60 w-[320px] min-w-[320px] h-full shadow-sm overflow-hidden">

            {/* 🏷️ Header: Minimalist & Clean */}
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                {todos.length} {todos.length <= 1 ? 'Task' : 'Tasks'}
                            </span>
                        </div>
                    </div>
                </div>

                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* 🗂️ Task List: Scrollable area */}
            <div className="flex-1 px-4 overflow-y-auto scrollbar-hide pb-4">
                {todos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50">
                        <Layout size={24} className="text-slate-300 mb-2" />
                        <p className="text-[11px] font-bold text-slate-400 uppercase">ว่างเปล่า</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todos.map((todo) => (
                            <TodoCard
                                key={todo.id}
                                todo={todo}
                                boardId={boardId}
                                onEdit={() => handleEdit(todo)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ➕ Footer Button: Always accessible */}
            {status === 'TODO' && (
                <div className="p-4 bg-gradient-to-t from-slate-100/80 to-transparent">
                    <button
                        onClick={() => { setEditingTodo(null); setShowForm(true) }}
                        className="w-full py-3 bg-white hover:bg-slate-900 hover:text-white text-slate-600 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 font-bold text-xs"
                    >
                        <Plus size={16} />
                        เพิ่มงานใหม่
                    </button>
                </div>
            )}

            {/* ✅ เรียกใช้ Form เดิมที่คุณมี */}
            {showForm && (
                <TodoForm
                    boardId={boardId}
                    todo={editingTodo}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}
