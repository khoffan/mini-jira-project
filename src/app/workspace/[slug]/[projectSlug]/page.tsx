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
import { toNestedBoardDTO, toNestedProjectDTO } from "@/lib/mappers";
import type { IBoardLean, IProjectLean } from "@/lib/lean-types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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
    .lean<IProjectLean>();

  const boards = await Board.find({ projectId: String(project?._id) })
    .populate([
      { path: "tasks", model: Task },
      { path: "sourceOf", model: BoardEdge },
      { path: "targetOf", model: BoardEdge },
    ])
    .lean<IBoardLean[]>();

  if (!project || project.workspaceId !== String(workspace._id)) {
    notFound();
  }

  const projectDTO = toNestedProjectDTO(project);
  const workspaceId = String(workspace._id);
  const boardsDTO = boards.map(toNestedBoardDTO);

  // Calculate timeline progress
  const now = new Date();
  let timeProgress = 0;
  if (projectDTO.startDate && projectDTO.endDate) {
    const start = new Date(projectDTO.startDate).getTime();
    const end = new Date(projectDTO.endDate).getTime();
    const current = now.getTime();
    timeProgress = Math.min(
      Math.max(((current - start) / (end - start)) * 100, 0),
      100,
    );
  }

  const allEdges = projectDTO.boards.flatMap((board) =>
    (board.sourceOf || []).map((edge) => ({
      id: edge.id,
      sourceBoardId: edge.sourceBoardId,
      targetBoardId: edge.targetBoardId,
    })),
  );

  const statusVariant = {
    ACTIVE: "default",
    PAUSED: "secondary",
    COMPLETED: "outline",
    ARCHIVED: "secondary",
  } as const;

  return (
    <main className="flex-1 flex flex-col">
      <ProjectContextSetter
        project={{
          id: projectDTO.id,
          title: projectDTO.title,
          slug: projectDTO.slug,
        }}
      />

      {/* Project header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={statusVariant[projectDTO.status]}>
                {projectDTO.status}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flag className="h-3 w-3" />
                {projectDTO.priority}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight truncate">
              {projectDTO.title}
            </h1>
            {projectDTO.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {projectDTO.description}
              </p>
            )}
          </div>

          {/* Timeline */}
          {projectDTO.startDate && projectDTO.endDate && (
            <div className="flex items-center gap-3 bg-muted/60 rounded-lg px-4 py-2.5 shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Timeline
                </p>
                <p className="text-xs font-medium">
                  {format(new Date(projectDTO.startDate), "MMM d")} —{" "}
                  {format(new Date(projectDTO.endDate), "MMM d, yyyy")}
                </p>
                <Progress value={timeProgress} className="h-1 mt-1.5 w-32" />
              </div>
              <span className="text-xs font-bold text-primary">
                {Math.round(timeProgress)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Board content */}
      <div className="flex-1 p-6">
        <BoardDisplay
          boards={boardsDTO}
          edges={allEdges}
          workSlug={slug}
          projectSlug={projectSlug}
          workspaceId={workspaceId}
          projectId={projectDTO.id}
        />
      </div>
    </main>
  );
}
