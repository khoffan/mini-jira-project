"use server";

import dbConnect from "@/lib/db";
import Category from "@/lib/models/Category";
import Board from "@/lib/models/Board";
import { toCategoryDTO, toBoardDTO } from "@/lib/mappers";
import { revalidatePath } from "next/cache";
import { slugGenerator } from "@/utils/slug-generator";

export async function createCategoryAction({
  name,
  color,
  projectId,
  workspaceId,
}: {
  name: string;
  color: string;
  projectId: string;
  workspaceId: string;
}) {
  try {
    await dbConnect();
    const slug = slugGenerator({
      name,
    });
    const category = await Category.create({
      name,
      color,
      projectId,
    });
    revalidatePath(`/workspace/${workspaceId}/${projectId}`);
    return {
      success: true,
      category: toCategoryDTO(category.toObject({ virtuals: true })),
    };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction({
  id,
  name,
  color,
  workspaceId,
  projectId,
}: {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  projectId: string;
}) {
  try {
    await dbConnect();
    const category = await Category.findByIdAndUpdate(
      id,
      { name, color },
      { new: true },
    ).lean();
    revalidatePath(`/workspace/${workspaceId}/${projectId}`);
    return {
      success: true,
      category: category ? toCategoryDTO(category) : null,
    };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function createBoardAction({
  title,
  description,
  color,
  projectId,
  workspaceId,
}: {
  title: string;
  description?: string;
  color?: string;
  projectId: string;
  workspaceId: string;
}) {
  try {
    await dbConnect();
    const boardSlug = slugGenerator({ name: title });
    const board = await Board.create({
      title,
      slug: boardSlug,
      description: description ?? "",
      color: color ?? "#6366f1",
      projectId,
    });
    revalidatePath(`/workspace/${workspaceId}`);
    return {
      success: true,
      board: toBoardDTO(board.toObject({ virtuals: true })),
    };
  } catch (error) {
    console.error("Failed to create board:", error);
    return { success: false, error: "Failed to create board" };
  }
}

export async function updateBoardAction({
  id,
  title,
  description,
  color,
  workspaceSlug,
  projectSlug,
}: {
  id: string;
  title: string;
  description?: string;
  color?: string;
  workspaceSlug: string;
  projectSlug: string;
}) {
  try {
    await dbConnect();
    const board = await Board.findByIdAndUpdate(
      id,
      { title, description: description ?? "", color: color ?? "#6366f1" },
      { new: true },
    );
    revalidatePath(`/workspace/${workspaceSlug}/${projectSlug}`);
    return {
      success: true,
      board: board ? toBoardDTO(board.toObject({ virtuals: true })) : null,
    };
  } catch (error) {
    console.error("Failed to update board:", error);
    return { success: false, error: "Failed to update board" };
  }
}

export async function deleteBoardAction({
  id,
  workspaceSlug,
  projectSlug,
}: {
  id: string;
  workspaceSlug: string;
  projectSlug: string;
}) {
  try {
    await dbConnect();
    await Board.findByIdAndDelete(id);
    revalidatePath(`/workspace/${workspaceSlug}/${projectSlug}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete board:", error);
    return { success: false, error: "Failed to delete board" };
  }
}

export async function updateBoardPositionAction({
  boardId,
  positionX,
  positionY,
  workspaceId,
  projectId,
}: {
  boardId: string;
  positionX: number;
  positionY: number;
  workspaceId: string;
  projectId: string;
}) {
  try {
    await dbConnect();
    await Board.findByIdAndUpdate(boardId, { positionX, positionY });
    revalidatePath(`/workspace/${workspaceId}/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update board position:", error);
    return { success: false, error: "Failed to update board position" };
  }
}
