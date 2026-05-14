import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import Task from "@/lib/models/Task";
import BoardContextSetter from "./board-context.setter";
import ProjectContextSetter from "../project-context-setter";
import TodoColumn from "./todo-column";
import { toTaskDTO, toProjectDTO } from "@/lib/mappers";
import { Circle, Clock, CheckCircle2 } from "lucide-react";
import type { IBoardLean } from "@/lib/lean-types";

interface PageProps {
  params: Promise<{ slug: string; projectSlug: string; boradSlug: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { slug, projectSlug, boradSlug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const workspace = await Workspace.findOne({ slug }).lean();
  if (!workspace || workspace.ownerId !== session.uid) notFound();

  const project = await Project.findOne({ slug: projectSlug }).lean();
  if (!project || project.workspaceId !== String(workspace._id)) notFound();

  const boardDoc = await Board.findOne({ slug: boradSlug })
    .populate({
      path: "tasks",
      model: Task,
      options: { sort: { createdAt: 1 } },
    })
    .lean<IBoardLean>();

  if (!boardDoc || boardDoc.projectId !== String(project._id)) notFound();

  const projectDTO = toProjectDTO(project);
  const serializedTasks = (boardDoc.tasks ?? []).map((t) =>
    toTaskDTO(t as Parameters<typeof toTaskDTO>[0]),
  );

  const tasksByStatus = {
    TODO: serializedTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: serializedTasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: serializedTasks.filter((t) => t.status === "DONE"),
  };

  const boardId = String(boardDoc._id);
  const boardColor = boardDoc.color ?? "#6366f1";

  const columns = [
    {
      title: "To Do",
      status: "TODO" as const,
      color: "#3b82f6",
      icon: <Circle className="h-3.5 w-3.5" />,
      todos: tasksByStatus.TODO,
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS" as const,
      color: "#f59e0b",
      icon: <Clock className="h-3.5 w-3.5" />,
      todos: tasksByStatus.IN_PROGRESS,
    },
    {
      title: "Done",
      status: "DONE" as const,
      color: "#10b981",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      todos: tasksByStatus.DONE,
    },
  ];

  return (
    <main className="flex-1 flex flex-col min-h-0">
      <ProjectContextSetter
        project={{
          id: String(project._id),
          title: projectDTO.title,
          slug: projectDTO.slug,
        }}
      />
      <BoardContextSetter
        board={{
          id: boardId,
          title: boardDoc.title,
          slug: boradSlug,
        }}
      />

      {/* Board header */}
      <div className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: boardColor }}
        />
        <h1 className="text-lg font-semibold">{boardDoc.title}</h1>
        {boardDoc.description && (
          <p className="text-sm text-muted-foreground hidden sm:block">
            — {boardDoc.description}
          </p>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {serializedTasks.length} task{serializedTasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 p-6 min-w-max min-h-full">
          {columns.map((col) => (
            <TodoColumn
              key={col.status}
              title={col.title}
              status={col.status}
              todos={col.todos}
              boardId={boardId}
              color={col.color}
              icon={col.icon}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
