/**
 * Mappers: แปลง Mongoose lean()/toObject() result → typed App DTO
 *
 * ทำไมต้องมี mapper?
 * - lean() คืน plain object ที่มี _id แต่ไม่มี virtual `id`
 * - toObject({ virtuals: true }) คืนมีทั้ง _id และ id
 * - ทั้งสองกรณี timestamps เป็น Date object ไม่ใช่ string
 * - Mapper จัดการความไม่แน่นอนนี้ในที่เดียว แทนที่ JSON.parse(JSON.stringify()) กระจาย
 */

import type {
  IUser,
  IWorkspace,
  IProject,
  IBoard,
  ITask,
  IBoardEdge,
  ICategory,
  IComment,
  IProjectMember,
  INestedBoard,
  INestedProject,
  IWorkspaceWithNestedData,
} from "./types";
import type { IBoardLean, IProjectLean, IWorkspaceLean } from "./lean-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** แปลง Date object หรือ string เป็น ISO string เสมอ */
function formatDate(d: Date | string | null | undefined): string {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

/** อ่าน _id (lean) หรือ id (virtual) จาก Mongoose result */
function resolveId(doc: Record<string, unknown>): string {
  return (doc._id ?? doc.id) as string;
}

// ─── Model Mappers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toUserDTO(doc: Record<string, any>): IUser {
  return {
    uid: resolveId(doc),
    email: doc.email,
    name: doc.name ?? null,
    image: doc.image ?? null,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toWorkspaceDTO(doc: Record<string, any>): IWorkspace {
  return {
    id: resolveId(doc),
    name: doc.name,
    slug: doc.slug,
    ownerId: doc.ownerId ?? null,
    inviteCode: doc.inviteCode,
    isActive: doc.isActive,
    description: doc.description ?? null,
    logoUrl: doc.logoUrl ?? null,
    allowLinkJoin: doc.allowLinkJoin,
    isPublic: doc.isPublic,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProjectDTO(doc: Record<string, any>): IProject {
  return {
    id: resolveId(doc),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    isActive: doc.isActive,
    status: doc.status,
    priority: doc.priority,
    startDate: doc.startDate ? formatDate(doc.startDate) : null,
    endDate: doc.endDate ? formatDate(doc.endDate) : null,
    workspaceId: doc.workspaceId ?? null,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toBoardDTO(doc: Record<string, any>): IBoard {
  return {
    id: resolveId(doc),
    title: doc.title,
    slug: doc.slug,
    projectId: doc.projectId,
    isActive: doc.isActive,
    color: doc.color ?? null,
    description: doc.description ?? null,
    positionX: doc.positionX ?? 0,
    positionY: doc.positionY ?? 0,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toTaskDTO(doc: Record<string, any>): ITask {
  return {
    id: resolveId(doc),
    title: doc.title,
    description: doc.description,
    isCompleted: doc.isCompleted,
    status: doc.status,
    order: doc.order ?? 0,
    isActive: doc.isActive,
    priority: doc.priority,
    dueDate: doc.dueDate ? formatDate(doc.dueDate) : null,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
    categoryId: doc.categoryId ?? null,
    userId: doc.userId ?? null,
    boardId: doc.boardId ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toBoardEdgeDTO(doc: Record<string, any>): IBoardEdge {
  return {
    id: resolveId(doc),
    sourceBoardId: doc.sourceBoardId,
    targetBoardId: doc.targetBoardId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCategoryDTO(doc: Record<string, any>): ICategory {
  return {
    id: resolveId(doc),
    name: doc.name,
    color: doc.color,
    projectId: doc.projectId,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCommentDTO(doc: Record<string, any>): IComment {
  return {
    id: resolveId(doc),
    content: doc.content,
    taskId: doc.taskId,
    userId: doc.userId,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProjectMemberDTO(doc: Record<string, any>): IProjectMember {
  return {
    id: resolveId(doc),
    userId: doc.userId ?? null,
    workspaceId: doc.workspaceId ?? null,
    role: doc.role,
    createdAt: formatDate(doc.createdAt),
    updatedAt: formatDate(doc.updatedAt),
  };
}

// ─── Nested Mappers ───────────────────────────────────────────────────────────

export function toNestedBoardDTO(doc: IBoardLean): INestedBoard {
  return {
    ...toBoardDTO(doc),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: Array.isArray(doc.tasks)
      ? doc.tasks.map((t) => toTaskDTO(t as any))
      : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceOf: Array.isArray(doc.sourceOf)
      ? doc.sourceOf.map((e) => toBoardEdgeDTO(e as any))
      : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetOf: Array.isArray(doc.targetOf)
      ? doc.targetOf.map((e) => toBoardEdgeDTO(e as any))
      : null,
  };
}

export function toNestedProjectDTO(doc: IProjectLean): INestedProject {
  return {
    ...toProjectDTO(doc),
    boards: Array.isArray(doc.boards)
      ? doc.boards.map((b) => toNestedBoardDTO(b as IBoardLean))
      : [],
    edges: Array.isArray(doc.edges)
      ? doc.edges.map((e) => toBoardEdgeDTO(e as any))
      : [],
  };
}

export function toWorkspaceWithNestedDTO(
  doc: IWorkspaceLean,
): IWorkspaceWithNestedData {
  return {
    ...toWorkspaceDTO(doc),
    projects: Array.isArray(doc.projects)
      ? doc.projects.map((p) => toNestedProjectDTO(p as IProjectLean))
      : [],
  };
}
