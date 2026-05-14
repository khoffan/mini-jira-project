'use server'

import dbConnect from "@/lib/db"
import Workspace from "@/lib/models/Workspace"
import { IWorkspaceWithNestedData } from "@/lib/types"
import { slugGenerator } from "@/utils/slug-generator"
import { revalidatePath } from "next/cache"

export async function createWorkspaceAction({
    name,
    ownerId,
}: {
    name: string
    ownerId: string
}) {
    try {
        await dbConnect()
        const slug = slugGenerator({
            name
        })
        const workspace = await Workspace.create({
            name,
            slug,
            ownerId,
        })
        const result: IWorkspaceWithNestedData = JSON.parse(JSON.stringify(workspace))
        revalidatePath('/workspace')
        return { success: true, workspace: result }
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
        await dbConnect()
        const workspace = await Workspace.findByIdAndUpdate(id, { name }, { new: true }).lean()
        const result: IWorkspaceWithNestedData = JSON.parse(JSON.stringify(workspace))
        revalidatePath(`/workspace/${result.slug}`)
        return { success: true, workspace: result }
    } catch (error) {
        console.error("Failed to update workspace:", error)
        return { success: false, error: "Failed to update workspace" }
    }
}
