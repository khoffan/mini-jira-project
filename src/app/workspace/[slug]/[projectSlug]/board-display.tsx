"use client";

import BoardList from "./board-list";
import { INestedBoard } from "@/lib/types";

interface BoardEdgeData {
  id: string;
  sourceBoardId: string;
  targetBoardId: string;
}

interface BoardDisplayProps {
  boards: INestedBoard[];
  edges: BoardEdgeData[];
  workspaceId: string;
  projectId: string;
  workSlug: string;
  projectSlug: string;
}

export default function BoardDisplay({
  boards,
  workspaceId,
  projectId,
  workSlug,
  projectSlug,
}: BoardDisplayProps) {
  return (
    <BoardList
      boards={boards}
      workSlug={workSlug}
      projectSlug={projectSlug}
      workspaceId={workspaceId}
      projectId={projectId}
    />
  );
}

interface BoardDisplayProps {
  boards: INestedBoard[];
  edges: BoardEdgeData[];
  workspaceId: string;
  projectId: string;
  workSlug: string;
  projectSlug: string;
}
