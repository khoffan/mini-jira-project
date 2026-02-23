'use client'

import { useState } from 'react'
import BoardList, { type Board } from './board-list'
import { useViewStore } from '@/store/use-view-store'
import BoardCanvas from './board-canvas'
import BoardForm from './board-form'

interface BoardEdgeData {
    id: string
    sourceBoardId: string
    targetBoardId: string
}

interface BoardDisplayProps {
    boards: Board[]
    edges: BoardEdgeData[]
    workspaceId: string
    projectId: string
}

export default function BoardDisplay({ boards, edges, workspaceId, projectId }: BoardDisplayProps) {
    const [showForm, setShowForm] = useState(false)
    const { view } = useViewStore()

    function handleCreate() {
        setShowForm(true)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        บอร์ด
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                        จัดการบอร์ดและติดตามงานในโปรเจกต์นี้
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-200/50 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    สร้างบอร์ดใหม่
                </button>
            </div>

            {/* View Toggle */}
            {view === 'list' ? (
                <BoardList
                    boards={boards}
                    workspaceId={workspaceId}
                    projectId={projectId}
                />
            ) : (
                <BoardCanvas
                    boards={boards}
                    edges={edges}
                    workspaceId={workspaceId}
                    projectId={projectId}
                />
            )}

            {/* Board Form Modal */}
            {showForm && (
                <BoardForm
                    workspaceId={workspaceId}
                    projectId={projectId}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    )
}
