import { redirect, notFound } from 'next/navigation'
import { getServerSession } from '@/lib/get-session'
import dbConnect from '@/lib/db'
import Workspace from '@/lib/models/Workspace'
import Project from '@/lib/models/Project'
import Board from '@/lib/models/Board'
import Task from '@/lib/models/Task'
import Category from '@/lib/models/Category'
import WorkspaceSubNav from '@/components/layout/workspace/WorkspaceSubNav'
import { IWorkspaceWithNestedData } from '@/lib/types'

interface LayoutProps {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}

export default async function WorkspaceLayout({ children, params }: LayoutProps) {
    const { slug } = await params
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    await dbConnect()
    // Fetch current workspace
    const workspaceDoc = await Workspace.findOne({ slug }).populate({
        path: 'projects',
        model: Project,
        populate: [
            {
                path: 'boards',
                model: Board,
                populate: {
                    path: 'tasks',
                    model: Task
                }
            },
            {
                path: 'categories',
                model: Category
            }
        ]
    })

    const workspace = workspaceDoc ? workspaceDoc.toObject({ virtuals: true }) : null


    if (!workspace || workspace.ownerId !== session.uid) {
        notFound()
    }

    // Fetch all user workspaces for dropdown
    const allWorkspacesDocs = await Workspace.find({ ownerId: session.uid }).sort({ createdAt: -1 })

    const allWorkspaces = allWorkspacesDocs.map(doc => doc.toObject({ virtuals: true }))
    const serializedWorkspace: IWorkspaceWithNestedData = workspace && JSON.parse(JSON.stringify(workspace))
    const serializedAllWorkspaces: IWorkspaceWithNestedData[] = allWorkspaces.map(doc => JSON.parse(JSON.stringify(doc)))

    return (
        <>
            <WorkspaceSubNav
                workspace={serializedWorkspace}
                allWorkspaces={serializedAllWorkspaces}
            />
            {children}
        </>
    )
}
