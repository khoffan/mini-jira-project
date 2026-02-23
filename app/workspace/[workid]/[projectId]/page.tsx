import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import BoardDisplay from './board-display'
import ProjectContextSetter from './project-context-setter'

interface PageProps {
    params: Promise<{ workid: string; projectId: string }>
}

export default async function ProjectPage({ params }: PageProps) {
    const { workid, projectId } = await params
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workid },
    })

    if (!workspace || workspace.ownerId !== authUser.id) {
        notFound()
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            boards: {
                include: {
                    _count: {
                        select: { tasks: true },
                    },
                    sourceOf: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!project || project.workspaceId !== workid) {
        notFound()
    }

    // Serialize boards for client components
    const serializedBoards = project.boards.map((board) => ({
        id: board.id,
        title: board.title,
        positionX: board.positionX,
        positionY: board.positionY,
        createdAt: board.createdAt.toISOString(),
        _count: board._count,
    }))

    // Collect all edges from all boards
    const allEdges = project.boards.flatMap((board) =>
        board.sourceOf.map((edge) => ({
            id: edge.id,
            sourceBoardId: edge.sourceBoardId,
            targetBoardId: edge.targetBoardId,
        }))
    )

    return (
        <main className="app-container py-6 sm:py-8 lg:py-10">
            <ProjectContextSetter project={{ id: project.id, title: project.title }} />
            <BoardDisplay
                boards={serializedBoards}
                edges={allEdges}
                workspaceId={workid}
                projectId={projectId}
            />
        </main>
    )
}
