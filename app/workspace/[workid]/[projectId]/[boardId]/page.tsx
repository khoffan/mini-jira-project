import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ workid: string; projectId: string; boardId: string }>
}

export default async function BoardPage({ params }: PageProps) {
    const { workid, projectId, boardId } = await params
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findUnique({
        where: { id: workid },
    })

    if (!workspace || workspace.ownerId !== authUser.id) {
        notFound()
    }

    // Fetch project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    })

    if (!project || project.workspaceId !== workid) {
        notFound()
    }

    // Fetch board with task counts
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            _count: {
                select: { tasks: true },
            },
            tasks: {
                select: { status: true },
            },
        },
    })

    if (!board || board.projectId !== projectId) {
        notFound()
    }

    const taskStats = {
        total: board._count.tasks,
        todo: board.tasks.filter((t) => t.status === 'TODO').length,
        inProgress: board.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        done: board.tasks.filter((t) => t.status === 'DONE').length,
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="app-container py-6 sm:py-8 lg:py-10">
                {/* Back Navigation */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href={`/workspace/${workid}/${projectId}`}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {board.title}
                        </h1>
                        <p className="text-sm text-slate-500">{project.title}</p>
                    </div>
                </div>

                {/* Task Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">ทั้งหมด</p>
                        <p className="text-2xl font-extrabold text-slate-900">{taskStats.total}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-1">To Do</p>
                        <p className="text-2xl font-extrabold text-blue-600">{taskStats.todo}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-1">In Progress</p>
                        <p className="text-2xl font-extrabold text-amber-600">{taskStats.inProgress}</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">Done</p>
                        <p className="text-2xl font-extrabold text-emerald-600">{taskStats.done}</p>
                    </div>
                </div>

                {/* Go to Task Management */}
                <Link
                    href={`/workspace/${workid}/${projectId}/${boardId}/task`}
                    className="group flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                จัดการ Task
                            </h3>
                            <p className="text-sm text-slate-500">
                                ดูและจัดการงานทั้งหมด {taskStats.total} รายการในบอร์ดนี้
                            </p>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}
