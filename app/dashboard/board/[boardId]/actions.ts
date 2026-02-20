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
        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                boardId,
            },
        })
        revalidatePath(`/dashboard/board/${boardId}`)
        return { success: true, todo }
    } catch (error) {
        console.error("Failed to create todo:", error)
        return { success: false, error: "Failed to create todo" }
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
        const todo = await prisma.todo.update({
            where: { id },
            data: { title, description },
        })
        revalidatePath(`/dashboard/board/${boardId}`)
        return { success: true, todo }
    } catch (error) {
        console.error("Failed to update todo:", error)
        return { success: false, error: "Failed to update todo" }
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
        const todo = await prisma.todo.update({
            where: { id },
            data: { status },
        })
        revalidatePath(`/dashboard/board/${boardId}`)
        return { success: true, todo }
    } catch (error) {
        console.error("Failed to update todo status:", error)
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
        await prisma.todo.delete({
            where: { id },
        })
        revalidatePath(`/dashboard/board/${boardId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to delete todo:", error)
        return { success: false, error: "Failed to delete todo" }
    }
}
