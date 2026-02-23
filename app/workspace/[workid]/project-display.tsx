"use client"

import { useState } from "react"
import { LayoutGrid, Share2, Settings, UserPlus } from "lucide-react"
import ProjectList, { Project } from "./project-list"
import { useViewStore } from "@/store/use-view-store"
import ProjectCanvas from "./project-canvas"

interface ProjectListProps {
    projects: Project[]
    workspaceId: string
}


export default function ProjectDisplay({ projects, workspaceId }: ProjectListProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    const { view, setView } = useViewStore()

    function handleCreate() {
        setEditingProject(null)
        setShowForm(true)
    }
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        โปรเจกต์
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                        จัดการโปรเจกต์และติดตามงานทั้งหมดของคุณ
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    สร้างโปรเจกต์ใหม่
                </button>
            </div>
            {view === 'list' ? <ProjectList
                projects={projects}
                workspaceId={workspaceId}
            /> : <ProjectCanvas
                projects={projects}
                workspaceId={workspaceId}
            />}
        </div>
    )
}