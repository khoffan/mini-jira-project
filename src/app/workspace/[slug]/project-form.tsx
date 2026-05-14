'use client'

import { useState } from 'react'
import { createProjectAction, updateProjectAction } from './actions'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Flag,
    Activity,
    ChevronDown,
    Layout
} from 'lucide-react'
import { Priority, ProjectStatus } from '@/lib/types'




interface Project {
    id: string
    title: string
    description: string
    status?: ProjectStatus
    priority?: Priority
    startDate?: Date | string | null
    endDate?: Date | string | null
}

interface ProjectFormProps {
    workspaceId: string
    slug: string
    project?: Project | null
    onClose: () => void
}

interface IFormError {
    titleError?: string
    descriptionError?: string
    statusError?: string
    priorityError?: string
    startDateError?: string
    endDateError?: string
}

export default function ProjectForm({ workspaceId, slug, project, onClose }: ProjectFormProps) {
    const router = useRouter()
    const isEditing = !!project

    // States ตาม Model ใหม่
    const [title, setTitle] = useState(project?.title || '')
    const [description, setDescription] = useState(project?.description || '')
    const [status, setStatus] = useState<ProjectStatus>(project?.status || 'ACTIVE')
    const [priority, setPriority] = useState<Priority>(project?.priority || 'MEDIUM')
    const [startDate, setStartDate] = useState(project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '')
    const [endDate, setEndDate] = useState(project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '')
    const [formError, setFormError] = useState<IFormError>({})

    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) {
            setFormError({ ...formError, titleError: 'กรุณาระบุชื่อโปรเจกต์' })
            return
        }
        if (!description.trim()) {
            setFormError({ ...formError, descriptionError: 'กรุณาระบุรายละเอียดโปรเจกต์' })
            return
        }
        if (!startDate) {
            setFormError({ ...formError, startDateError: 'กรุณาระบุวันที่เริ่มต้น' })
            return
        }
        if (!endDate) {
            setFormError({ ...formError, endDateError: 'กรุณาระบุวันที่สิ้นสุด' })
            return
        }
        if (!status) {
            setFormError({ ...formError, statusError: 'กรุณาระบุสถานะ' })
            return
        }
        if (!priority) {
            setFormError({ ...formError, priorityError: 'กรุณาระบุลำดับความสำคัญ' })
            return
        }


        setLoading(true)
        try {
            const payload = {
                title,
                description,
                status,
                priority,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                workspaceId
            }

            if (isEditing && project) {
                await updateProjectAction({ id: project.id, slug: slug, ...payload })
            } else {
                await createProjectAction({ ...payload, slug: slug })
            }
            router.refresh()
            onClose()
        } catch (error) {
            console.error('Failed to save project:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">

                {/* Header: ใช้ Gradient ที่ดู Professional ขึ้น */}
                <div className="px-8 py-6 border-b border-slate-100 bg-linear-to-br from-white to-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl">
                            <Layout size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditing ? 'ตั้งค่าโปรเจกต์' : 'สร้างโปรเจกต์ใหม่'}
                            </h2>
                            <p className="text-sm text-slate-500">จัดการข้อมูลและ Lifecycle ของงาน</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* ส่วนข้อมูลหลัก */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">ชื่อโปรเจกต์</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น Q1 Roadmap, Website Redesign"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                required
                            />
                            {formError.titleError && (
                                <p className="text-red-500 text-sm">{formError.titleError}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">รายละเอียด</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="เป้าหมายของโปรเจกต์นี้คืออะไร..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                            />
                            {formError.descriptionError && (
                                <p className="text-red-500 text-sm">{formError.descriptionError}</p>
                            )}
                        </div>
                    </div>

                    {/* ส่วนการตั้งค่า Management (Status & Priority) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Activity size={14} /> สถานะ
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                                    className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="PAUSED">Paused</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {formError.statusError && (
                                <p className="text-red-500 text-sm">{formError.statusError}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Flag size={14} /> ความสำคัญ
                            </label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as Priority)}
                                    className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent 🚨</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            {formError.priorityError && (
                                <p className="text-red-500 text-sm">{formError.priorityError}</p>
                            )}
                        </div>
                    </div>

                    {/* ส่วน Timeline (Start & End Date) */}
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} /> Project Timeline
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500">วันที่เริ่ม</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formError.startDateError && (
                                    <p className="text-red-500 text-sm">{formError.startDateError}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500">วันที่สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formError.endDateError && (
                                    <p className="text-red-500 text-sm">{formError.endDateError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                        >
                            {loading ? 'กำลังบันทึก...' : isEditing ? 'อัปเดตโปรเจกต์' : 'สร้างโปรเจกต์'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}