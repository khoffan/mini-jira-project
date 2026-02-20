'use server'

import prisma from "@/lib/prisma/prisma_conf"
import { revalidatePath } from "next/cache"

export async function createBoardAction({
    title,
    description,
    userId,
}: {
    title: string
    description: string
    userId: string
}) {
    try {
        const board = await prisma.board.create({
            data: {
                title,
                description,
                userId,
            },
        })
        revalidatePath('/dashboard')
        return { success: true, board }
    } catch (error) {
        console.error("Failed to create board:", error)
        return { success: false, error: "Failed to create board" }
    }
}

export async function updateBoardAction({
    id,
    title,
    description,
}: {
    id: string
    title: string
    description: string
}) {
    try {
        const board = await prisma.board.update({
            where: { id },
            data: {
                title,
                description,
            },
        })
        revalidatePath('/dashboard')
        return { success: true, board }
    } catch (error) {
        console.error("Failed to update board:", error)
        return { success: false, error: "Failed to update board" }
    }
}
