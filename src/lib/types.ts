/**
 * Type Definitions for Mini-Jira (MongoDB / Firebase)
 * ใช้ Literal Types แทน Prisma Enum เพื่อความยืดหยุ่น
 */

// ─── Literal Types (เหมือน enum แต่ type-safe กว่า) ───────────────────────────

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type Role = "EDITOR" | "VIEWER" | "ADMIN";

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface IUser {
  uid: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerId?: string | null;
  inviteCode: string;
  isActive: boolean;
  description?: string | null;
  logoUrl?: string | null;
  allowLinkJoin: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string | null;
  endDate?: string | null;
  workspaceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBoard {
  id: string;
  title: string;
  slug: string;
  projectId: string;
  isActive: boolean;
  color?: string | null;
  description?: string | null;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  status: TaskStatus;
  order: number;
  isActive: boolean;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  userId?: string | null;
  boardId?: string | null;
}

export interface IBoardEdge {
  id: string;
  sourceBoardId: string;
  targetBoardId: string;
}

export interface ICategory {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  userId: string;
}

export interface IProjectMember {
  id: string;
  userId?: string | null;
  workspaceId?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// ─── Server Action Response ───────────────────────────────────────────────────

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface INestedBoard extends IBoard {
  tasks: ITask[];
  sourceOf?: IBoardEdge[] | null;
  targetOf?: IBoardEdge[] | null;
}

// ─── Nested Project ─────────────────────────────────────────────────────────
export interface INestedProject extends IProject {
  boards: INestedBoard[];
  edges: IBoardEdge[];
}

// ─── Workspace with Nested Data ─────────────────────────────────────────────
export interface IWorkspaceWithNestedData extends IWorkspace {
  projects: INestedProject[];
}
