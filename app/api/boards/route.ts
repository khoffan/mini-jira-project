import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma/prisma_conf"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 }
        )
    }

    try {
        const boards = await prisma.board.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { todos: true },
                },
            },
            orderBy: { createAt: "desc" },
        })

        return NextResponse.json(boards)
    } catch (error) {
        console.error("Failed to fetch boards:", error)
        return NextResponse.json(
            { error: "Failed to fetch boards" },
            { status: 500 }
        )
    }
}
