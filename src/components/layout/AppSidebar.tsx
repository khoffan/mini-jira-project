"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  UserPlus,
  Settings,
  LogOut,
  FolderKanban,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IWorkspaceWithNestedData } from "@/lib/types";

interface AppSidebarProps {
  workspace: IWorkspaceWithNestedData;
  allWorkspaces: IWorkspaceWithNestedData[];
}

export function AppSidebar({ workspace, allWorkspaces }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

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

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Header: Workspace Switcher ─────────────────── */}
      <SidebarHeader className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {workspace.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Workspace
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Workspaces
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allWorkspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => router.push(`/workspace/${ws.slug}`)}
                    className="gap-2 cursor-pointer"
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        ws.id === workspace.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate flex-1">{ws.name}</span>
                    {ws.id === workspace.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/workspace/create")}
                  className="gap-2 cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/40">
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm">สร้าง Workspace ใหม่</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Content: Project & Board Nav ─────────────────── */}
      <SidebarContent>
        {/* Overview link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === `/workspace/${workspace.slug}`}
                  tooltip="ภาพรวม"
                  onClick={() => router.push(`/workspace/${workspace.slug}`)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>ภาพรวม</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between pr-1">
            <span>โปรเจกต์</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => router.push(`/workspace/${workspace.slug}`)}
              title="สร้างโปรเจกต์ใหม่"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspace.projects.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  ยังไม่มีโปรเจกต์
                </p>
              ) : (
                workspace.projects.map((project) => {
                  const projectPath = `/workspace/${workspace.slug}/${project.slug}`;
                  const isProjectActive = pathname.startsWith(projectPath);
                  const isExpanded = expandedProjects.has(project.id);

                  return (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        isActive={isProjectActive && !isExpanded}
                        tooltip={project.title}
                        onClick={() => toggleProject(project.id)}
                        className="group/proj"
                      >
                        <FolderKanban className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{project.title}</span>
                        {project.boards.length > 0 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-[10px] group-hover/proj:hidden"
                            >
                              {project.boards.length}
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 hidden group-hover/proj:block" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 hidden group-hover/proj:block" />
                            )}
                          </>
                        )}
                      </SidebarMenuButton>

                      {/* Board sub-items */}
                      {isExpanded && project.boards.length > 0 && (
                        <SidebarMenuSub>
                          {project.boards.map((board) => {
                            const boardPath = `${projectPath}/${board.slug}`;
                            return (
                              <SidebarMenuSubItem key={board.id}>
                                <SidebarMenuSubButton
                                  isActive={pathname.startsWith(boardPath)}
                                  onClick={() => router.push(boardPath)}
                                >
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor: board.color ?? "#6366f1",
                                    }}
                                  />
                                  <span className="truncate">
                                    {board.title}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              onClick={() => router.push(projectPath)}
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                เพิ่ม Board
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: Invite + User ─────────────────── */}
      <SidebarFooter className="gap-1 p-2">
        <SidebarSeparator className="mb-1" />

        {/* Invite & Settings row */}
        <div className="flex items-center gap-1 px-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground h-8"
            onClick={handleInvite}
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-xs group-data-[collapsible=icon]:hidden">
              เชิญสมาชิก
            </span>
          </Button>
          <ThemeToggle />
        </div>

        {/* User menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user?.image && (
                      <AvatarImage src={user.image} alt={user.name ?? ""} />
                    )}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold">
                      {user?.name ?? "ผู้ใช้"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold leading-none">
                      {user?.name ?? "ผู้ใช้"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/account")}
                  className="gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  ตั้งค่าบัญชี
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
