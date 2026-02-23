"use client"

import { useState, useRef, useEffect } from 'react'
import { UserPlus, Settings, ChevronRight, ChevronDown, Plus, Check, LayoutGrid, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useViewStore } from '@/store/use-view-store'
import { useProjectStore } from '@/store/use-project-store'

interface WorkspaceSubNavProps {
    workspace: {
        id: string
        name: string
        inviteCode: string
    }
    allWorkspaces?: {
        id: string
        name: string
    }[]
    boards?: {
        id: string
        title: string
    } | null
}

export default function WorkspaceSubNav({ workspace, allWorkspaces = [], boards }: WorkspaceSubNavProps) {
    const router = useRouter()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { view, setView } = useViewStore()
    const project = useProjectStore((s) => s.project)


    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInviteClick = () => {
        Swal.fire({
            title: 'Invite Members',
            html: `
        <div class="text-left space-y-4">
          <p class="text-sm text-slate-500">แชร์รหัสนี้ให้ทีมของคุณเพื่อเข้าร่วม Workspace</p>
          <div class="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
            <code id="invite-code" class="flex-1 font-mono font-bold text-blue-600">${workspace.inviteCode || 'N/A'}</code>
          </div>
        </div>
      `,
            showCancelButton: true,
            confirmButtonText: 'Copy Code',
            confirmButtonColor: '#6366f1',
            preConfirm: () => {
                const code = workspace.inviteCode
                if (code) {
                    navigator.clipboard.writeText(code)
                    return code
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                toast.success("คัดลอกรหัสเชิญเรียบร้อยแล้ว!")
            }
        })
    }

    function handleSelectWorkspace(id: string) {
        setDropdownOpen(false)
        router.push(`/workspace/${id}`)
    }

    return (
        <div className="glass border-b border-slate-200/80 sticky top-14 sm:top-16 z-30">
            <div className="app-container h-12 sm:h-14 flex items-center justify-between gap-2">

                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-visible">
                    {/* Workspace Dropdown */}
                    <div className="relative shrink-0" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-slate-100/80 rounded-lg cursor-pointer border border-slate-200/80 transition-colors"
                        >
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm truncate max-w-20 sm:max-w-36">{workspace.name}</span>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workspaces</p>
                                </div>
                                <div className="max-h-52 overflow-y-auto py-1">
                                    {allWorkspaces.map((ws) => (
                                        <button
                                            key={ws.id}
                                            onClick={() => handleSelectWorkspace(ws.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${ws.id === workspace.id ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${ws.id === workspace.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {ws.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`text-sm truncate flex-1 ${ws.id === workspace.id ? 'font-semibold text-indigo-700' : 'text-slate-700'}`}>
                                                {ws.name}
                                            </span>
                                            {ws.id === workspace.id && (
                                                <Check size={14} className="text-indigo-600 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 pt-1 pb-0.5">
                                    <Link
                                        href="/workspace/create"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors rounded-md mx-1"
                                    >
                                        <Plus size={16} />
                                        สร้าง Workspace ใหม่
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project breadcrumb */}
                    {project && (
                        <>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            <Link
                                href={`/workspace/${workspace.id}/${project.id}`}
                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-slate-100/80 rounded-lg cursor-pointer border border-slate-200/80 transition-colors shrink-0"
                            >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                    {project.title.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700 text-xs sm:text-sm truncate max-w-20 sm:max-w-36">{project.title}</span>
                            </Link>
                        </>
                    )}

                    {/* Category breadcrumb */}
                    {boards && (
                        <>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 shrink-0">
                                <span className="font-medium text-slate-700 text-xs sm:text-sm truncate max-w-20 sm:max-w-36">{boards.title}</span>
                            </div>
                        </>
                    )}

                    {/* Divider + Nav tabs — hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2 ml-2">
                        <div className="h-6 w-px bg-slate-200" />
                        <nav className="flex items-center gap-1 ml-1">
                            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md">Boards</button>
                            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-all">Members</button>
                        </nav>
                    </div>
                </div>

                {/* Right Side: View Switcher + Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                    {/* 🚀 เพิ่ม View Switcher ตรงนี้ (แสดงเฉพาะเมื่ออยู่ในหน้า Project) */}
                    {project && (
                        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                            <button
                                onClick={() => setView('list')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'list'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                title="แสดงแบบรายการ"
                            >
                                <LayoutGrid size={14} />
                                <span className="hidden lg:inline">List</span>
                            </button>

                            <button
                                onClick={() => setView('canvas')}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${view === 'canvas'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                title="แสดงแบบแคนวาส"
                            >
                                <Share2 size={14} className="rotate-90" />
                                <span className="hidden lg:inline">Canvas</span>
                            </button>
                        </div>
                    )}

                    <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={handleInviteClick}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <UserPlus size={14} />
                            <span className="hidden sm:inline">Invite</span>
                        </button>

                        <button className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            <Settings size={16} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
