"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutList, Kanban } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useViewStore } from "@/store/use-view-store";
import { useProjectStore } from "@/store/use-project-store";
import { useBoardStore } from "@/store/use-board-store";
import type { IWorkspaceWithNestedData } from "@/lib/types";

interface TopBarProps {
  workspace: IWorkspaceWithNestedData;
  onCreateProject?: () => void;
}

export function TopBar({ workspace, onCreateProject }: TopBarProps) {
  const pathname = usePathname();
  const { view, setView } = useViewStore();
  const project = useProjectStore((s) => s.project);
  const board = useBoardStore((s) => s.board);

  // Determine what the Create button does based on context
  const isOnProjectPage = !!project && !board;
  const isOnWorkspacePage = !project;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4">
      {/* Sidebar toggle + breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/workspace/${workspace.slug}`}
                className="text-sm font-medium"
              >
                {workspace.name}
              </BreadcrumbLink>
            </BreadcrumbItem>

            {project && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {board ? (
                    <BreadcrumbLink
                      href={`/workspace/${workspace.slug}/${project.slug}`}
                      className="text-sm"
                    >
                      {project.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-sm font-medium">
                      {project.title}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}

            {board && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium">
                    {board.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* View toggle — shown when in project context (not in board) */}
        {isOnProjectPage && (
          <div className="flex items-center rounded-lg border bg-muted p-0.5 gap-0.5">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2.5"
              onClick={() => setView("list")}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:inline">รายการ</span>
            </Button>
            <Button
              variant={view === "canvas" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2.5"
              onClick={() => setView("canvas")}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:inline">บอร์ด</span>
            </Button>
          </div>
        )}

        {/* Create button — on workspace page */}
        {isOnWorkspacePage && onCreateProject && (
          <Button size="sm" onClick={onCreateProject} className="gap-1.5 h-8">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">สร้างโปรเจกต์</span>
          </Button>
        )}
      </div>
    </header>
  );
}
