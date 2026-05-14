import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import Board from "@/lib/models/Board";
import Task from "@/lib/models/Task";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { toWorkspaceWithNestedDTO } from "@/lib/mappers";
import type { IWorkspaceLean } from "@/lib/lean-types";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  // Fetch current workspace with full nested populate
  const workspaceDoc = await Workspace.findOne({ slug })
    .populate({
      path: "projects",
      model: Project,
      populate: [
        {
          path: "boards",
          model: Board,
          populate: {
            path: "tasks",
            model: Task,
          },
        },
      ],
    })
    .lean<IWorkspaceLean>();

  if (!workspaceDoc || workspaceDoc.ownerId !== session.uid) {
    notFound();
  }

  // Fetch all user workspaces for sidebar dropdown
  const allWorkspacesDocs = await Workspace.find({ ownerId: session.uid })
    .sort({ createdAt: -1 })
    .lean<IWorkspaceLean[]>();

  const serializedWorkspace = toWorkspaceWithNestedDTO(workspaceDoc);
  const serializedAllWorkspaces = allWorkspacesDocs.map(
    toWorkspaceWithNestedDTO,
  );

  return (
    <SidebarProvider>
      <AppSidebar
        workspace={serializedWorkspace}
        allWorkspaces={serializedAllWorkspaces}
      />
      <SidebarInset className="flex flex-col min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
