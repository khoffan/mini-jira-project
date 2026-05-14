import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import ProjectList from "./project-list";
import { INestedProject, IWorkspaceWithNestedData } from "@/lib/types";

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
    .lean<IWorkspaceWithNestedData>();

  if (!workspace || workspace.ownerId !== session.uid) {
    notFound();
  }

  const serializedProjects = workspace.projects.map((p: INestedProject) => ({
    ...p,
    _count: { boards: p.boards ? p.boards.length : 0 },
    createdAt: p.createAt ? new Date(p.createAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updateAt ? new Date(p.createAt).toISOString() : new Date().toISOString(),
  }));

  console.log("serializedProjects", serializedProjects);

  return (
    <main className="app-container py-6 sm:py-8">
      <ProjectList projects={serializedProjects} workspaceId={workspace.id} slug={workspace.slug} />
    </main>
  );
}
