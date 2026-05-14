import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/get-session'
import dbConnect from '@/lib/db'
import Workspace from '@/lib/models/Workspace'

export default async function WorkspaceIndexPage() {
    const session = await getServerSession()
    if (!session) {
        redirect('/login')
    }

    await dbConnect()
    // Find first workspace for this user
    const firstWorkspace = await Workspace.findOne({ ownerId: session.uid })
        .sort({ createdAt: -1 })
        .select('slug')
        .lean()

    if (firstWorkspace) {
        redirect(`/workspace/${firstWorkspace.slug}`)
    } else {
        redirect(`/workspace/create`)
    }
}
