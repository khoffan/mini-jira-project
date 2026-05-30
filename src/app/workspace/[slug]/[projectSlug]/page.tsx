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
import { Tag, Progress, Divider } from "antd";

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
    timeProgress = Math.min(Math.max(((current - start) / (end - start)) * 100, 0), 100);
  }

  const allEdges = projectDTO.boards.flatMap((board) =>
    (board.sourceOf || []).map((edge) => ({
      id: edge.id,
      sourceBoardId: edge.sourceBoardId,
      targetBoardId: edge.targetBoardId,
    })),
  );

  const statusColor = {
    ACTIVE: "blue",
    PAUSED: "orange",
    COMPLETED: "green",
    ARCHIVED: "default",
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
      <div
        style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa", padding: "24px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <Tag color={statusColor[projectDTO.status]}>{projectDTO.status}</Tag>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: "#999",
                }}
              >
                <Flag size={12} />
                {projectDTO.priority}
              </span>
            </div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                margin: "0 0 4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {projectDTO.title}
            </h1>
            {projectDTO.description && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#999",
                  margin: "4px 0 0",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {projectDTO.description}
              </p>
            )}
          </div>

          {/* Timeline */}
          {projectDTO.startDate && projectDTO.endDate && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  padding: "12px 16px",
                }}
              >
                <Calendar size={16} style={{ color: "#999" }} />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "4px",
                    }}
                  >
                    Timeline
                  </p>
                  <p style={{ fontSize: "12px", fontWeight: "500", marginBottom: "8px" }}>
                    {format(new Date(projectDTO.startDate), "MMM d")} —{" "}
                    {format(new Date(projectDTO.endDate), "MMM d, yyyy")}
                  </p>
                  <Progress percent={Math.round(timeProgress)} size="small" />
                </div>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1890ff" }}>
                  {Math.round(timeProgress)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Board content */}
      <div style={{ flex: 1, padding: "24px" }}>
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
