import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import BoardList from './board-list'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    let profile = null;
    if (authUser) {
        profile = await prisma.user.findUnique({
            where: { uid: authUser.id },
        })
    }

    if (!authUser) {
        redirect('/login')
    }

    const boards = await prisma.board.findMany({
        where: { userId: authUser.id },
        include: {
            _count: {
                select: { todos: true },
            },
        },
        orderBy: { createAt: 'desc' },
    })

    // Serialize dates for client component
    const serializedBoards = boards.map((board) => ({
        ...board,
        createAt: board.createAt.toISOString(),
        updateAt: board.updateAt.toISOString(),
    }))

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            {/* <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Mini Jira</span>
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <BoardList boards={serializedBoards} userId={authUser.id} />
            </main>
        </div>
    )
}
