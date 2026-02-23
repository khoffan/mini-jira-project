import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'
import WorkspaceSubNav from '@/components/layout/workspace/WorkspaceSubNav'

interface LayoutProps {
    children: React.ReactNode
    params: Promise<{ workid: string }>
}

export default async function WorkspaceLayout({ children, params }: LayoutProps) {
    const { workid } = await params
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    // Fetch current workspace
    const workspace = await prisma.workspace.findUnique({
        where: { id: workid }, include: {
            projects: {
                include: {
                    boards: {
                        include: {
                            tasks: true
                        }
                    },
                    categories: true
                }
            }
        },
    })


    if (!workspace || workspace.ownerId !== authUser.id) {
        notFound()
    }

    // Fetch all user workspaces for dropdown
    const allWorkspaces = await prisma.workspace.findMany({
        where: { ownerId: authUser.id },
        select: { id: true, name: true },
        orderBy: { createAt: 'desc' },
    })

    return (
        <>
            <WorkspaceSubNav
                workspace={workspace}
                allWorkspaces={allWorkspaces}
            />
            {children}
        </>
    )
}
