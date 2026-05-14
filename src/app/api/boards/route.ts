import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Workspace from "@/lib/models/Workspace";
import Project from "@/lib/models/Project";
import { toWorkspaceWithNestedDTO } from "@/lib/mappers";
import type { IWorkspaceLean } from "@/lib/lean-types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const workspacesDocs = await Workspace.find({ ownerId: userId })
      .populate({
        path: "projects",
        model: Project,
      })
      .sort({ createdAt: -1 })
      .lean<IWorkspaceLean[]>();

    const workspaces = workspacesDocs.map((w) => ({
      ...toWorkspaceWithNestedDTO(w),
      _count: { projects: w.projects?.length ?? 0 },
    }));

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}
