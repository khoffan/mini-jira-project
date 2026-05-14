/**
 * Lean + Populated Types
 *
 * IXxxDocument = stored fields เท่านั้น (ใช้เป็น model generic)
 * IXxxLean     = IXxxDocument + virtual populate fields (ใช้เป็น .lean<IXxxLean>() type param)
 *
 * virtual populate fields เป็น optional เพราะขึ้นอยู่กับว่า query นั้น populate ด้วยหรือเปล่า
 * mappers รับ IXxxLean แล้วแปลงเป็น App DTO (IXxx) ที่ client ใช้งาน
 */

import type { IWorkspaceDocument } from "./models/Workspace";
import type { IProjectDocument } from "./models/Project";
import type { IBoardDocument } from "./models/Board";
import type { ITaskDocument } from "./models/Task";
import type { IBoardEdgeDocument } from "./models/BoardEdge";

// ─── Board Lean ────────────────────────────────────────────────────────────────
// tasks, sourceOf, targetOf เป็น virtual populate ใน BoardSchema

export type IBoardLean = IBoardDocument & {
  tasks?: ITaskDocument[];
  sourceOf?: IBoardEdgeDocument[];
  targetOf?: IBoardEdgeDocument[];
};

// ─── Project Lean ─────────────────────────────────────────────────────────────
// boards, edges เป็น virtual populate ใน ProjectSchema

export type IProjectLean = IProjectDocument & {
  boards?: IBoardLean[];
  edges?: IBoardEdgeDocument[];
};

// ─── Workspace Lean ───────────────────────────────────────────────────────────
// projects เป็น virtual populate ใน WorkspaceSchema

export type IWorkspaceLean = IWorkspaceDocument & {
  projects?: IProjectLean[];
};
