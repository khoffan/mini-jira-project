'use server'

import prisma from "@/lib/prisma/prisma_conf"
import { revalidatePath } from "next/cache"

export async function createProjectAction({
    title,
    description,
    workspaceId,
}: {
    title: string
    description: string
    workspaceId: string
}) {
    try {
        const project = await prisma.project.create({
            data: {
                title,
                description,
                workspaceId,
            },
        })
        revalidatePath(`/workspace/${workspaceId}`)
        return { success: true, project }
    } catch (error) {
        console.error("Failed to create project:", error)
        return { success: false, error: "Failed to create project" }
    }
}

export async function updateProjectAction({
    id,
    title,
    description,
    workspaceId,
}: {
    id: string
    title: string
    description: string
    workspaceId: string
}) {
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { title, description },
        })
        revalidatePath(`/workspace/${workspaceId}`)
        return { success: true, project }
    } catch (error) {
        console.error("Failed to update project:", error)
        return { success: false, error: "Failed to update project" }
    }
}
