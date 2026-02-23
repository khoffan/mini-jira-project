'use client'

import { useState } from 'react'
import ProjectForm from './project-form'
import Link from 'next/link'

export interface Project {
    id: string
    title: string
    description: string
    createAt: string
    updateAt: string
    _count?: {
        boards: number
    }
}

interface ProjectListProps {
    projects: Project[]
    workspaceId: string
}

const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-emerald-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
]

export default function ProjectList({ projects, workspaceId }: ProjectListProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    function handleEdit(project: Project) {
        setEditingProject(project)
        setShowForm(true)
    }

    function handleCreate() {
        setEditingProject(null)
        setShowForm(true)
    }

    function handleCloseForm() {
        setShowForm(false)
        setEditingProject(null)
    }

    return (
        <div>
            {/* Project Grid */}
            {projects.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">ยังไม่มีโปรเจกต์</h3>
                    <p className="text-sm sm:text-base text-slate-500 mb-6">สร้างโปรเจกต์แรกของคุณเพื่อเริ่มจัดการงาน</p>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200/50"
                    >
                        สร้างโปรเจกต์แรก
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {projects.map((project, i) => (
                        <div
                            key={project.id}
                            className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                        >
                            {/* Gradient top bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${gradients[i % gradients.length]}`} />

                            {/* Edit Button */}
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(project) }}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all z-10"
                                title="แก้ไขโปรเจกต์"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>

                            <Link href={`/workspace/${workspaceId}/${project.id}`} className="block">
                                {/* Card Header */}
                                <div className="flex items-start mb-3">
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br ${gradients[i % gradients.length]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                        {project.title.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors truncate">
                                    {project.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-4">
                                    {project.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
                                        </svg>
                                        {new Date(project.createAt).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    {project._count && (
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                            {project._count.boards} งาน
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Project Form Modal */}
            {showForm && (
                <ProjectForm
                    workspaceId={workspaceId}
                    project={editingProject}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}
