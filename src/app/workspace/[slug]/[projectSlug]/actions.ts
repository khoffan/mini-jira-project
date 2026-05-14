'use server'

import dbConnect from "@/lib/db"
import Category from "@/lib/models/Category"
import Board from "@/lib/models/Board"
import { revalidatePath } from "next/cache"
import { slugGenerator } from "@/utils/slug-generator"

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
        await dbConnect()
        const slug = slugGenerator({
            name
        })
        const category = await Category.create({
            name,
            color,
            projectId,
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
        await dbConnect()
        const category = await Category.findByIdAndUpdate(id, { name, color }, { new: true }).lean()
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
        await dbConnect()
        const slug = slugGenerator({
            name: title,
        })
        const board = await Board.create({
            title,
            projectId,
        })
        revalidatePath(`/workspace/${workspaceId}/${slug}`)
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
        await dbConnect()
        await Board.findByIdAndUpdate(boardId, { positionX, positionY })
        revalidatePath(`/workspace/${workspaceId}/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update board position:", error)
        return { success: false, error: "Failed to update board position" }
    }
}
