/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import BoardDisplay from "./board-display";
import ProjectContextSetter from "./project-context-setter";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns/format";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import Task from "@/lib/models/Task";
import BoardEdge from "@/lib/models/BoardEdge";
import { INestedBoard, INestedProject, IWorkspace } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string; projectSlug: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug, projectSlug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const workspace = await Workspace.findOne({ slug }).lean();

  if (!workspace || workspace.ownerId !== session.uid) {
    notFound();
  }

  const project = await Project.findOne({ slug: projectSlug })
    .populate({
      path: "boards",
      model: Board,
      options: { sort: { createdAt: -1 } },
      populate: [{ path: "sourceOf", model: BoardEdge }],
    })
    .lean<INestedProject>();

  const boards = await Board.find({ projectId: project?.id })
    .populate([
      { path: "tasks", model: Task },
      { path: "sourceOf", model: BoardEdge },
      { path: "targetOf", model: BoardEdge },
    ])
    .lean<INestedBoard[]>();

  if (!project || project.workspaceId !== workspace._id) {
    notFound();
  }

  // คำนวณความคืบหน้าของเวลา (Timeline Progress)
  const now = new Date();
  let timeProgress = 0;
  if (project.startDate && project.endDate) {
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const current = now.getTime();
    timeProgress = Math.min(Math.max(((current - start) / (end - start)) * 100, 0), 100);
  }

  // Collect all edges from all boards
  const allEdges = project.boards.flatMap((board: any) =>
    (board.sourceOf || []).map((edge: any) => ({
      id: edge._id || edge.id,
      sourceBoardId: edge.sourceBoardId,
      targetBoardId: edge.targetBoardId,
    })),
  );

  console.log("Serialized Boards:", boards);

  return (
    <main className="app-container py-6 sm:py-8 lg:py-10">
      {/* 📊 Mini Dashboard Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm my-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  project.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {project.status}
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Flag size={12} className={project.priority === "URGENT" ? "text-red-500" : ""} />
                {project.priority} Priority
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-none">{project.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{project.description}</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Timeline Display */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Calendar size={18} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Project Timeline
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "N/A"}
                  {" - "}
                  {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </div>

            {/* Progress Tracker */}
            {project.startDate && project.endDate && (
              <div className="hidden lg:block w-32">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                  <span className="text-[10px] font-bold text-slate-700">
                    {Math.round(timeProgress)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ProjectContextSetter
        project={{ id: project.id, title: project.title, slug: project.slug }}
      />
      <BoardDisplay
        boards={boards}
        edges={allEdges}
        workSlug={slug}
        projectSlug={projectSlug}
        workspaceId={workspace?.id ?? ""}
        projectId={project?.id ?? ""}
      />
    </main>
  );
}
