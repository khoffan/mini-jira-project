"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  ChevronDown,
  Plus,
  UserPlus,
  Settings,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { Layout, Menu, Dropdown, Avatar, Tag, Button, Divider, Space } from "antd";
import type { MenuProps } from "antd";
import { useAuthStore } from "@/store/authStore";
import type { IWorkspaceWithNestedData } from "@/lib/types";

const { Sider } = Layout;

interface AppSidebarProps {
  workspace: IWorkspaceWithNestedData;
  allWorkspaces: IWorkspaceWithNestedData[];
}

export function AppSidebar({ workspace, allWorkspaces }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  function toggleProject(projectId: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }

  function handleInvite() {
    if (!workspace.inviteCode) return;
    navigator.clipboard.writeText(workspace.inviteCode);
    toast.success("คัดลอกรหัสเชิญแล้ว!", {
      description: `รหัส: ${workspace.inviteCode}`,
    });
  }

  async function handleLogout() {
    try {
      clearAuth();
      router.push("/login");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.slice(0, 2).toUpperCase() ?? "?");

  // Workspace switcher dropdown items
  const workspaceMenuItems: MenuProps["items"] = [
    {
      type: "group",
      label: "Workspaces",
      children: allWorkspaces.map((ws) => ({
        key: ws.id,
        label: (
          <div className="flex items-center justify-between">
            <span>{ws.name}</span>
            {ws.id === workspace.id && (
              <span style={{ fontSize: "12px", marginLeft: "8px" }}>✓</span>
            )}
          </div>
        ),
        onClick: () => router.push(`/workspace/${ws.slug}`),
      })),
    },
    { type: "divider" },
    {
      key: "create-workspace",
      label: "+ สร้าง Workspace ใหม่",
      onClick: () => router.push("/workspace/create"),
    },
  ];

  // User menu items
  const userMenuItems: MenuProps["items"] = [
    {
      type: "group",
      label: user?.name ?? "ผู้ใช้",
      children: [
        {
          key: "account",
          label: (
            <Space size={8}>
              <Settings style={{ fontSize: "14px" }} />
              <span>ตั้งค่าบัญชี</span>
            </Space>
          ),
          onClick: () => router.push("/account"),
        },
      ],
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <Space size={8} style={{ color: "#ff4d4f" }}>
          <LogOut style={{ fontSize: "14px" }} />
          <span>ออกจากระบบ</span>
        </Space>
      ),
      onClick: handleLogout,
    },
  ];

  // Build menu items for projects and boards
  const buildMenuItems = (): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        key: `overview`,
        icon: <LayoutGrid style={{ fontSize: "16px" }} />,
        label: "ภาพรวม",
        onClick: () => router.push(`/workspace/${workspace.slug}`),
      },
    ];

    if (workspace.projects.length > 0) {
      items.push({
        type: "divider",
      });

      workspace.projects.forEach((project) => {
        const projectPath = `/workspace/${workspace.slug}/${project.slug}`;
        const children: MenuProps["items"] = [];

        if (project.boards.length > 0) {
          project.boards.forEach((board) => {
            const boardPath = `${projectPath}/${board.slug}`;
            children.push({
              key: boardPath,
              label: (
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: board.color ?? "#1890ff",
                    }}
                  />
                  {board.title}
                </div>
              ),
              onClick: () => router.push(boardPath),
            });
          });

          children.push({
            key: `${projectPath}-add`,
            label: (
              <div className="flex items-center gap-2" style={{ color: "#999" }}>
                <Plus style={{ fontSize: "14px" }} />
                <span>เพิ่ม Board</span>
              </div>
            ),
            onClick: () => router.push(projectPath),
          });
        }

        items.push({
          key: projectPath,
          icon: <FolderKanban style={{ fontSize: "16px" }} />,
          label: (
            <div className="flex items-center justify-between">
              <span>{project.title}</span>
              {project.boards.length > 0 && (
                <Tag color="default" style={{ marginLeft: "8px" }}>
                  {project.boards.length}
                </Tag>
              )}
            </div>
          ),
          children: children.length > 0 ? children : undefined,
          onClick: children.length === 0 ? () => router.push(projectPath) : undefined,
        });
      });
    }

    return items;
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        background: "transparent",
        borderRight: "1px solid #f0f0f0",
      }}
      width={250}
    >
      {/* Header: Workspace Switcher */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <Dropdown menu={{ items: workspaceMenuItems }} trigger={["click"]}>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fafafa",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fafafa")}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                backgroundColor: "#1890ff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {workspace.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Workspace
                  </div>
                </div>
                <ChevronDown style={{ fontSize: "16px", flexShrink: 0 }} />
              </>
            )}
          </div>
        </Dropdown>
      </div>

      {/* Menu: Projects and Boards */}
      <Menu
        mode="inline"
        items={buildMenuItems()}
        selectedKeys={[pathname]}
        defaultOpenKeys={Array.from(expandedProjects)}
      />

      {/* Footer: Invite and User Menu */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid #f0f0f0",
          marginTop: "auto",
        }}
      >
        <Space orientation="vertical" style={{ width: "100%" }} size={0}>
          <Button
            type="text"
            block
            icon={<UserPlus style={{ fontSize: "16px" }} />}
            onClick={handleInvite}
            style={{ justifyContent: "flex-start", height: "36px" }}
          >
            {!collapsed && "เชิญสมาชิก"}
          </Button>

          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Avatar
                size={32}
                src={user?.image}
                style={{
                  backgroundColor: "#1890ff",
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </Avatar>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.name ?? "ผู้ใช้"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown style={{ fontSize: "16px", flexShrink: 0 }} />
                </>
              )}
            </div>
          </Dropdown>
        </Space>
      </div>
    </Sider>
  );
}
