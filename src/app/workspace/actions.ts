"use server";

import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import { toWorkspaceWithNestedDTO } from "@/lib/mappers";
import { slugGenerator } from "@/utils/slug-generator";
import { revalidatePath } from "next/cache";

export async function createWorkspaceAction({
  name,
  ownerId,
}: {
  name: string;
  ownerId: string;
}) {
  try {
    await dbConnect();
    const slug = slugGenerator({
      name,
    });
    const workspace = await Workspace.create({
      name,
      slug,
      ownerId,
    });
    revalidatePath("/workspace");
    return {
      success: true,
      workspace: toWorkspaceWithNestedDTO(
        workspace.toObject({ virtuals: true }),
      ),
    };
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return { success: false, error: "Failed to create workspace" };
  }
}

export async function updateWorkspaceAction({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  try {
    await dbConnect();
    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    ).lean();
    if (!workspace) return { success: false, error: "Workspace not found" };
    const result = toWorkspaceWithNestedDTO(workspace);
    revalidatePath(`/workspace/${result.slug}`);
    return { success: true, workspace: result };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return { success: false, error: "Failed to update workspace" };
  }
}
