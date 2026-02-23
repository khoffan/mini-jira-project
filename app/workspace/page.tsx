import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/prisma_conf'

export default async function WorkspaceIndexPage() {
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    // Find first workspace for this user
    const firstWorkspace = await prisma.workspace.findFirst({
        where: { ownerId: authUser.id },
        select: { id: true },
        orderBy: { createAt: 'desc' },
    })

    if (firstWorkspace) {
        redirect(`/workspace/${firstWorkspace.id}`)
    } else {
        redirect('/workspace/create')
    }
}
