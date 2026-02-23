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
        const workspaces = await prisma.workspace.findMany({
            where: { ownerId: userId },
            include: {
                _count: {
                    select: { projects: true },
                },
            },
            orderBy: { createAt: "desc" },
        })

        return NextResponse.json(workspaces)
    } catch (error) {
        console.error("Failed to fetch workspaces:", error)
        return NextResponse.json(
            { error: "Failed to fetch workspaces" },
            { status: 500 }
        )
    }
}
