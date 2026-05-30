"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutList, Kanban, Menu } from "lucide-react";
import { Breadcrumb, Button, Space, Divider } from "antd";
import { useViewStore } from "@/store/use-view-store";
import { useProjectStore } from "@/store/use-project-store";
import { useBoardStore } from "@/store/use-board-store";
import type { IWorkspaceWithNestedData } from "@/lib/types";

interface TopBarProps {
  workspace: IWorkspaceWithNestedData;
  onCreateProject?: () => void;
  onToggleSidebar?: () => void;
}

export function TopBar({ workspace, onCreateProject, onToggleSidebar }: TopBarProps) {
  const pathname = usePathname();
  const { view, setView } = useViewStore();
  const project = useProjectStore((s) => s.project);
  const board = useBoardStore((s) => s.board);

  // Determine what the Create button does based on context
  const isOnProjectPage = !!project && !board;
  const isOnWorkspacePage = !project;

  const breadcrumbItems = [
    {
      title: (
        <Link href={`/workspace/${workspace.slug}`} style={{ color: "#1890ff" }}>
          {workspace.name}
        </Link>
      ),
    },
  ];

  if (project) {
    if (board) {
      breadcrumbItems.push({
        title: (
          <Link href={`/workspace/${workspace.slug}/${project.slug}`} style={{ color: "#1890ff" }}>
            {project.title}
          </Link>
        ),
      });
      breadcrumbItems.push({
        title: <span style={{ color: "#000" }}>{board.title}</span>,
      });
    } else {
      breadcrumbItems.push({
        title: <span style={{ color: "#000" }}>{project.title}</span>,
      });
    }
  }

  return (
    <header
      style={{
        display: "flex",
        height: "48px",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(4px)",
        paddingLeft: "16px",
        paddingRight: "16px",
        zIndex: 10,
      }}
    >
      {/* Sidebar toggle + breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
          minWidth: 0,
        }}
      >
        {onToggleSidebar && (
          <Button
            type="text"
            icon={<Menu style={{ fontSize: "16px" }} />}
            onClick={onToggleSidebar}
            style={{ height: "32px", width: "32px" }}
          />
        )}

        <Divider type="vertical" style={{ height: "16px", margin: 0 }} />

        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* View toggle — shown when in project context (not in board) */}
        {isOnProjectPage && (
          <Space.Compact>
            <Button
              type={view === "list" ? "primary" : "default"}
              size="small"
              icon={<LayoutList style={{ fontSize: "14px" }} />}
              onClick={() => setView("list")}
              title="รายการ"
            >
              <span style={{ display: "none", fontSize: "12px" }}>รายการ</span>
            </Button>
            <Button
              type={view === "canvas" ? "primary" : "default"}
              size="small"
              icon={<Kanban style={{ fontSize: "14px" }} />}
              onClick={() => setView("canvas")}
              title="บอร์ด"
            >
              <span style={{ display: "none", fontSize: "12px" }}>บอร์ด</span>
            </Button>
          </Space.Compact>
        )}

        {/* Create button — on workspace page */}
        {isOnWorkspacePage && onCreateProject && (
          <Button
            type="primary"
            size="small"
            icon={<Plus style={{ fontSize: "14px" }} />}
            onClick={onCreateProject}
          >
            <span style={{ marginLeft: "4px" }}>สร้างโปรเจกต์</span>
          </Button>
        )}
      </div>
    </header>
  );
}
