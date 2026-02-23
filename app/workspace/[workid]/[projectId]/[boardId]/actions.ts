'use server'

import prisma from "@/lib/prisma/prisma_conf"
import { revalidatePath } from "next/cache"

export async function createTodoAction({
    title,
    description,
    boardId,
}: {
    title: string
    description: string
    boardId: string
}) {
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                boardId,
            },
        })
        revalidatePath(`/workspace`)
        return { success: true, todo: task }
    } catch (error) {
        console.error("Failed to create task:", error)
        return { success: false, error: "Failed to create task" }
    }
}

export async function updateTodoAction({
    id,
    title,
    description,
    boardId,
}: {
    id: string
    title: string
    description: string
    boardId: string
}) {
    try {
        const task = await prisma.task.update({
            where: { id },
            data: { title, description },
        })
        revalidatePath(`/workspace`)
        return { success: true, todo: task }
    } catch (error) {
        console.error("Failed to update task:", error)
        return { success: false, error: "Failed to update task" }
    }
}

export async function updateTodoStatusAction({
    id,
    status,
    boardId,
}: {
    id: string
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    boardId: string
}) {
    try {
        const task = await prisma.task.update({
            where: { id },
            data: { status },
        })
        revalidatePath(`/workspace`)
        return { success: true, todo: task }
    } catch (error) {
        console.error("Failed to update task status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteTodoAction({
    id,
    boardId,
}: {
    id: string
    boardId: string
}) {
    try {
        await prisma.task.delete({
            where: { id },
        })
        revalidatePath(`/workspace`)
        return { success: true }
    } catch (error) {
        console.error("Failed to delete task:", error)
        return { success: false, error: "Failed to delete task" }
    }
}
