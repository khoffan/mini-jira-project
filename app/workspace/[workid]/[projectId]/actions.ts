'use server'

import prisma from "@/lib/prisma/prisma_conf"
import { revalidatePath } from "next/cache"

export async function createCategoryAction({
    name,
    color,
    projectId,
    workspaceId,
}: {
    name: string
    color: string
    projectId: string
    workspaceId: string
}) {
    try {
        const category = await prisma.category.create({
            data: {
                name,
                color,
                projectId,
            },
        })
        revalidatePath(`/workspace/${workspaceId}/${projectId}`)
        return { success: true, category }
    } catch (error) {
        console.error("Failed to create category:", error)
        return { success: false, error: "Failed to create category" }
    }
}

export async function updateCategoryAction({
    id,
    name,
    color,
    workspaceId,
    projectId,
}: {
    id: string
    name: string
    color: string
    workspaceId: string
    projectId: string
}) {
    try {
        const category = await prisma.category.update({
            where: { id },
            data: { name, color },
        })
        revalidatePath(`/workspace/${workspaceId}/${projectId}`)
        return { success: true, category }
    } catch (error) {
        console.error("Failed to update category:", error)
        return { success: false, error: "Failed to update category" }
    }
}

export async function createBoardAction({
    title,
    projectId,
    workspaceId,
}: {
    title: string
    projectId: string
    workspaceId: string
}) {
    try {
        const board = await prisma.board.create({
            data: {
                title,
                projectId,
            },
        })
        revalidatePath(`/workspace/${workspaceId}/${projectId}`)
        return { success: true, board }
    } catch (error) {
        console.error("Failed to create board:", error)
        return { success: false, error: "Failed to create board" }
    }
}

export async function updateBoardPositionAction({
    boardId,
    positionX,
    positionY,
    workspaceId,
    projectId,
}: {
    boardId: string
    positionX: number
    positionY: number
    workspaceId: string
    projectId: string
}) {
    try {
        await prisma.board.update({
            where: { id: boardId },
            data: { positionX, positionY },
        })
        revalidatePath(`/workspace/${workspaceId}/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update board position:", error)
        return { success: false, error: "Failed to update board position" }
    }
}
