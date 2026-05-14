import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import ProjectList from "./project-list";
import { toNestedProjectDTO, toWorkspaceDTO } from "@/lib/mappers";
import type { IWorkspaceLean } from "@/lib/lean-types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const workspace = await Workspace.findOne({ slug })
    .populate({
      path: "projects",
      model: Project,
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "boards",
        model: Board,
      },
    })
    .lean<IWorkspaceLean>();

  if (!workspace || workspace.ownerId !== session.uid) {
    notFound();
  }

  const workspaceDTO = toWorkspaceDTO(workspace);
  const serializedProjects = (workspace.projects ?? []).map((p) => ({
    ...toNestedProjectDTO(p),
    _count: { boards: Array.isArray(p.boards) ? p.boards.length : 0 },
  }));

  return (
    <main className="flex-1 p-6">
      <ProjectList
        projects={serializedProjects}
        workspaceId={workspaceDTO.id}
        slug={workspaceDTO.slug}
      />
    </main>
  );
}
