"use server";

import dbConnect from "@/lib/db";
import Task from "@/lib/models/Task";
import { toTaskDTO } from "@/lib/mappers";
import { revalidatePath } from "next/cache";
import type { TaskStatus, Priority } from "@/lib/types";

export async function createTodoAction({
  title,
  description,
  status,
  priority,
  dueDate,
  boardId,
}: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  boardId: string;
}) {
  try {
    await dbConnect();
    const task = await Task.create({
      title,
      description: description ?? "",
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      dueDate: dueDate ?? null,
      boardId,
    });
    revalidatePath(`/workspace`);
    return {
      success: true,
      todo: toTaskDTO(task.toObject({ virtuals: true })),
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTodoAction({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  boardId,
}: {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  boardId: string;
}) {
  try {
    await dbConnect();
    const task = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description: description ?? "",
        status: status ?? "TODO",
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ?? null,
      },
      { new: true },
    ).lean();
    revalidatePath(`/workspace`);
    return { success: true, todo: task ? toTaskDTO(task) : null };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function updateTodoStatusAction({
  id,
  status,
  boardId,
}: {
  id: string;
  status: TaskStatus;
  boardId: string;
}) {
  try {
    await dbConnect();
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).lean();
    revalidatePath(`/workspace`);
    return { success: true, todo: task ? toTaskDTO(task) : null };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteTodoAction({
  id,
  boardId,
}: {
  id: string;
  boardId: string;
}) {
  try {
    await dbConnect();
    await Task.findByIdAndDelete(id);
    revalidatePath(`/workspace`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
