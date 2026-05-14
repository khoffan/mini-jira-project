import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import TaskModel from "@/lib/models/Task";
import TodoColumn from "@/app/workspace/[slug]/[projectSlug]/[boradSlug]/todo-column";
import Link from "next/link";
import { ITask } from "@/lib/types";
import BoardContextSetter from "@/app/workspace/[slug]/[projectSlug]/[boradSlug]/board-context.setter";

interface PageProps {
  params: Promise<{ workid: string; projectId: string; boardId: string }>;
}

export default async function TaskPage({ params }: PageProps) {
  const { workid, projectId, boardId } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  // Verify workspace ownership
  const workspace = await Workspace.findById(workid).lean();

  if (!workspace || workspace.ownerId !== session.uid) {
    notFound();
  }

  // Fetch project
  const project = await Project.findById(projectId).lean();

  if (!project || project.workspaceId !== workid) {
    notFound();
  }

  // Fetch board with its tasks
  const boardDoc = await Board.findById(boardId)
    .populate({
      path: "tasks",
      model: TaskModel,
      options: { sort: { createdAt: 1 } },
    })
    .lean();

  if (!boardDoc || boardDoc.projectId !== projectId) {
    notFound();
  }

  const board = boardDoc;

  if (!board || board.projectId !== projectId) {
    notFound();
  }

  // Serialize dates for client components
  const serializedTasks = board.tasks
    ? board.tasks.map((task: any) => ({
        ...task,
        createAt: task.createdAt
          ? new Date(task.createdAt).toISOString()
          : new Date().toISOString(),
        updateAt: task.updatedAt
          ? new Date(task.updatedAt).toISOString()
          : new Date().toISOString(),
        id: task._id,
      }))
    : [];

  const tasksByStatus = {
    TODO: serializedTasks.filter((t: any) => t.status === "TODO"),
    IN_PROGRESS: serializedTasks.filter((t: any) => t.status === "IN_PROGRESS"),
    DONE: serializedTasks.filter((t: any) => t.status === "DONE"),
  };

  const columns = [
    {
      title: "To Do",
      status: "TODO",
      color: "bg-blue-100 text-blue-600",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      ),
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS",
      color: "bg-amber-100 text-amber-600",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      title: "Done",
      status: "DONE",
      color: "bg-emerald-100 text-emerald-600",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <BoardContextSetter boardId={boardId} boardTitle={board.title} />
      <div className="app-container pt-6 sm:pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/workspace/${workid}/${projectId}`}
            className="text-slate-400 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{board.title}</h1>
            <p className="text-sm text-slate-500">{project.title} · จัดการ Task</p>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <main className="app-container pb-8 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {columns.map((col) => {
            const todoTask: ITask[] = tasksByStatus[
              col.status as keyof typeof tasksByStatus
            ] as ITask[];

            return (
              <TodoColumn
                key={col.status}
                title={col.title}
                status={col.status}
                todos={todoTask}
                boardId={boardId}
                color={col.color}
                icon={col.icon}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
