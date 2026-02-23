'use server'

import prisma from "@/lib/prisma/prisma_conf"
import { revalidatePath } from "next/cache"

export async function createWorkspaceAction({
    name,
    ownerId,
}: {
    name: string
    ownerId: string
}) {
    try {
        const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
        const workspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                ownerId,
            },
        })
        revalidatePath('/workspace')
        return { success: true, workspace }
    } catch (error) {
        console.error("Failed to create workspace:", error)
        return { success: false, error: "Failed to create workspace" }
    }
}

export async function updateWorkspaceAction({
    id,
    name,
}: {
    id: string
    name: string
}) {
    try {
        const workspace = await prisma.workspace.update({
            where: { id },
            data: { name },
        })
        revalidatePath('/workspace')
        return { success: true, workspace }
    } catch (error) {
        console.error("Failed to update workspace:", error)
        return { success: false, error: "Failed to update workspace" }
    }
}
