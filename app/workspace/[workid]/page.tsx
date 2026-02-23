import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import ProjectList from './project-list'
import ProjectDisplay from './project-display'

interface PageProps {
    params: Promise<{ workid: string }>
}

export default async function WorkspacePage({ params }: PageProps) {
    const { workid } = await params
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workid },
        include: {
            projects: {
                include: {
                    _count: {
                        select: { boards: true },
                    },
                },
                orderBy: { createAt: 'desc' },
            },
        },
    })

    if (!workspace || workspace.ownerId !== authUser.id) {
        notFound()
    }

    const serializedProjects = workspace.projects.map((p) => ({
        ...p,
        createAt: p.createAt.toISOString(),
        updateAt: p.updateAt.toISOString(),
    }))

    return (
        <main className="app-container py-6 sm:py-8">
            <ProjectDisplay
                projects={serializedProjects}
                workspaceId={workid}
            />
        </main>
    )
}
