'use client'

import { useState } from 'react'
import BoardForm from './board-form'
import Link from 'next/link'

interface Board {
    id: string
    title: string
    description: string
    createAt: string
    updateAt: string
    _count?: {
        todos: number
    }
}

interface BoardListProps {
    boards: Board[]
    userId: string
}

export default function BoardList({ boards, userId }: BoardListProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingBoard, setEditingBoard] = useState<Board | null>(null)

    function handleEdit(board: Board) {
        setEditingBoard(board)
        setShowForm(true)
    }

    function handleCreate() {
        setEditingBoard(null)
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
        setEditingBoard(null)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        บอร์ดของฉัน
                    </h1>
                    <p className="text-slate-500 mt-1">
                        จัดการโปรเจกต์และติดตามงานทั้งหมดของคุณ
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    สร้างบอร์ดใหม่
                </button>
            </div>

            {/* Board Grid */}
            {boards.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีบอร์ด</h3>
                    <p className="text-slate-500 mb-6">สร้างบอร์ดแรกของคุณเพื่อเริ่มจัดการงาน</p>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-100"
                    >
                        สร้างบอร์ดแรก
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {boards.map((board) => (
                        <div
                            key={board.id}
                            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative"
                        >
                            {/* Edit Button */}
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(board) }}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all z-10"
                                title="แก้ไขบอร์ด"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>

                            <Link href={`/dashboard/board/${board.id}`} className="block">
                                {/* Card Header */}
                                <div className="flex items-start mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-100">
                                        {board.title.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                                    {board.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                    {board.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
                                        </svg>
                                        {new Date(board.createAt).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    {board._count && (
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                            {board._count.todos} งาน
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Board Form Modal */}
            {showForm && (
                <BoardForm
                    userId={userId}
                    board={editingBoard}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}
