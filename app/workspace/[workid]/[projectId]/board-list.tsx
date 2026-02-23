'use client'

import { useState } from 'react'
import BoardForm from './board-form'
import Link from 'next/link'

export interface Board {
    id: string
    title: string
    positionX: number
    positionY: number
    createdAt: string
    _count?: {
        tasks: number
    }
}

interface BoardListProps {
    boards: Board[]
    workspaceId: string
    projectId: string
}

const gradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
]

export default function BoardList({ boards, workspaceId, projectId }: BoardListProps) {
    const [showForm, setShowForm] = useState(false)

    function handleCreate() {
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
    }

    return (
        <div>
            {/* Board Grid */}
            {boards.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">ยังไม่มีบอร์ด</h3>
                    <p className="text-sm sm:text-base text-slate-500 mb-6">สร้างบอร์ดแรกเพื่อเริ่มจัดการ Task ในโปรเจกต์นี้</p>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200/50"
                    >
                        สร้างบอร์ดแรก
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {boards.map((board, i) => (
                        <div
                            key={board.id}
                            className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                        >
                            {/* Gradient top bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${gradients[i % gradients.length]}`} />

                            <Link href={`/workspace/${workspaceId}/${projectId}/${board.id}`} className="block">
                                {/* Card Header */}
                                <div className="flex items-start mb-3">
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br ${gradients[i % gradients.length]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                        {board.title.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors truncate">
                                    {board.title}
                                </h3>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
                                        </svg>
                                        {new Date(board.createdAt).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    {board._count && (
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                            {board._count.tasks} งาน
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
                    workspaceId={workspaceId}
                    projectId={projectId}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}
