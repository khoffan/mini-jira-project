"use server";

import { Priority, ProjectStatus } from "@/lib/types";
import { toNestedProjectDTO, toProjectDTO } from "@/lib/mappers";
import dbConnect from "@/lib/db";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import Task from "@/lib/models/Task";
import Comment from "@/lib/models/Comment";
import BoardEdge from "@/lib/models/BoardEdge";
import Category from "@/lib/models/Category";
import { revalidatePath } from "next/cache";
import { slugGenerator } from "@/utils/slug-generator";

export async function createProjectAction({
  title,
  description,
  workspaceId,
  status,
  priority,
  startDate,
  endDate,
  slug,
}: {
  title: string;
  description: string;
  workspaceId: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date | string | null;
  endDate: Date | string | null;
  slug: string;
}) {
  try {
    await dbConnect();
    const projectSlug = slugGenerator({
      name: title,
    });
    const project = await Project.create({
      title,
      slug: projectSlug,
      description,
      workspaceId,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });
    console.log(project);
    revalidatePath(`/workspace/${slug}`);
    return { success: true, project: toProjectDTO(project.toObject()) };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProjectAction({
  id,
  title,
  description,
  workspaceId,
  status,
  priority,
  startDate,
  endDate,
  slug,
}: {
  id: string;
  title: string;
  description: string;
  workspaceId: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date | string | null;
  endDate: Date | string | null;
  slug: string;
}) {
  try {
    await dbConnect();
    const project = await Project.findByIdAndUpdate(
      id,
      {
        title,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      { new: true },
    ).lean();
    if (!project) return { success: false, error: "Project not found" };
    revalidatePath(`/workspace/${slug}`);
    return { success: true, project: toNestedProjectDTO(project) };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProjectAction({
  id,
  workspaceId,
}: {
  id: string;
  workspaceId: string;
}) {
  try {
    await dbConnect();
    // 1. Get all board IDs belonging to this project
    const boards = await Board.find({ projectId: id }).select("_id").lean();
    const boardIds = boards.map((board) => String(board._id));

    // 2. Get all task IDs belonging to those boards
    const tasks = await Task.find({ boardId: { $in: boardIds } })
      .select("_id")
      .lean();
    const taskIds = tasks.map((task) => String(task._id));

    // 3. Delete comments on those tasks
    await Comment.deleteMany({ taskId: { $in: taskIds } });

    // 4. Delete tasks
    await Task.deleteMany({ _id: { $in: taskIds } });

    // 5. Delete board edges (dependencies between boards)
    await BoardEdge.deleteMany({
      $or: [
        { sourceBoardId: { $in: boardIds } },
        { targetBoardId: { $in: boardIds } },
      ],
    });

    // 6. Delete boards
    await Board.deleteMany({ projectId: id });

    // 7. Delete categories
    await Category.deleteMany({ projectId: id });

    // 8. Delete the project itself
    await Project.findByIdAndDelete(id);

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
