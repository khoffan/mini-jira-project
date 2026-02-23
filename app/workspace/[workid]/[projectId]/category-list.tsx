'use client'

import { useState } from 'react'
import CategoryForm from './category-form'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    color: string
    createAt: string
    updateAt: string
    _count?: {
        tasks: number
    }
}

interface CategoryListProps {
    categories: Category[]
    workspaceId: string
    projectId: string
}

export default function CategoryList({ categories, workspaceId, projectId }: CategoryListProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    function handleEdit(category: Category) {
        setEditingCategory(category)
        setShowForm(true)
    }

    function handleCreate() {
        setEditingCategory(null)
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
        setEditingCategory(null)
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

            {/* Category Grid */}
            {categories.length === 0 ? (
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
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                        >
                            {/* Color top bar from category */}
                            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: cat.color }} />

                            {/* Edit Button */}
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(cat) }}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all z-10"
                                title="แก้ไขบอร์ด"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>

                            <Link href={`/workspace/${workspaceId}/${projectId}/${cat.id}`} className="block">
                                {/* Card Header */}
                                <div className="flex items-start mb-3">
                                    <div
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        {cat.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors truncate">
                                    {cat.name}
                                </h3>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
                                        </svg>
                                        {new Date(cat.createAt).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    {cat._count && (
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                            {cat._count.tasks} งาน
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Form Modal */}
            {showForm && (
                <CategoryForm
                    workspaceId={workspaceId}
                    projectId={projectId}
                    category={editingCategory}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}
