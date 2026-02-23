import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import TodoColumn from '../todo-column'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ workid: string; projectId: string; boardId: string }>
}

export default async function TaskPage({ params }: PageProps) {
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

    // Fetch board with its tasks
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            tasks: {
                orderBy: { createAt: 'asc' },
            },
        },
    })

    if (!board || board.projectId !== projectId) {
        notFound()
    }

    // Serialize dates for client components
    const serializedTasks = board.tasks.map((task) => ({
        ...task,
        createAt: task.createAt.toISOString(),
        updateAt: task.updateAt.toISOString(),
    }))

    const todosByStatus = {
        TODO: serializedTasks.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: serializedTasks.filter((t) => t.status === 'IN_PROGRESS'),
        DONE: serializedTasks.filter((t) => t.status === 'DONE'),
    }

    const columns = [
        {
            title: 'To Do',
            status: 'TODO',
            color: 'bg-blue-100 text-blue-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
            ),
        },
        {
            title: 'In Progress',
            status: 'IN_PROGRESS',
            color: 'bg-amber-100 text-amber-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            title: 'Done',
            status: 'DONE',
            color: 'bg-emerald-100 text-emerald-600',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Task Header */}
            <div className="app-container pt-6 sm:pt-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <Link
                        href={`/workspace/${workid}/${projectId}`}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {board.title}
                        </h1>
                        <p className="text-sm text-slate-500">{project.title} · จัดการ Task</p>
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <main className="app-container pb-8 sm:pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {columns.map((col) => (
                        <TodoColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            todos={todosByStatus[col.status as keyof typeof todosByStatus]}
                            boardId={boardId}
                            color={col.color}
                            icon={col.icon}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}
