'use client'

import { useState } from 'react'
import TodoCard from './todo-card'
import TodoForm from './todo-form'

interface Todo {
    id: string
    title: string
    description: string
    status: string
    createAt: string
    updateAt: string
}

interface TodoColumnProps {
    title: string
    status: string
    todos: Todo[]
    boardId: string
    color: string
    icon: React.ReactNode
}

export default function TodoColumn({ title, status, todos, boardId, color, icon }: TodoColumnProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

    function handleEdit(todo: Todo) {
        setEditingTodo(todo)
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
        setEditingTodo(null)
    }

    return (
        <div className="flex flex-col bg-slate-50/80 rounded-2xl border border-slate-200 min-h-[400px]">
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
                    <span className="text-xs font-medium text-slate-400 bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center">
                        {todos.length}
                    </span>
                </div>
                {status === 'TODO' && (
                    <button
                        onClick={() => { setEditingTodo(null); setShowForm(true) }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="เพิ่มงานใหม่"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {todos.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-xs text-slate-400">ยังไม่มีงาน</p>
                    </div>
                ) : (
                    todos.map((todo) => (
                        <TodoCard
                            key={todo.id}
                            todo={todo}
                            boardId={boardId}
                            onEdit={() => handleEdit(todo)}
                        />
                    ))
                )}
            </div>

            {/* Form Modal */}
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
