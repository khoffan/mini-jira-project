import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import TodoColumn from './todo-column'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ boardId: string }>
}

export default async function BoardPage({ params }: PageProps) {
    const { boardId } = await params
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            todos: {
                orderBy: { createAt: 'asc' },
            },
        },
    })

    if (!board || board.userId !== authUser.id) {
        notFound()
    }

    // Serialize dates for client components
    const serializedTodos = board.todos.map((todo) => ({
        ...todo,
        createAt: todo.createAt.toISOString(),
        updateAt: todo.updateAt.toISOString(),
    }))

    const todosByStatus = {
        TODO: serializedTodos.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: serializedTodos.filter((t) => t.status === 'IN_PROGRESS'),
        DONE: serializedTodos.filter((t) => t.status === 'DONE'),
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
            {/* Navigation */}
            {/* <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">Mini Jira</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{authUser.email}</span>
                        <a
                            href="/account"
                            className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                        >
                            {authUser.email?.charAt(0).toUpperCase()}
                        </a>
                    </div>
                </div>
            </nav> */}

            {/* Board Header */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <Link
                        href="/dashboard"
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
                        <p className="text-sm text-slate-500">{board.description}</p>
                    </div>
                </div>
            </div>

            {/* Kanban Columns */}
            <main className="max-w-7xl mx-auto px-6 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
