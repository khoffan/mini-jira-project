"use client";

import BoardList from "./board-list";
import { useViewStore } from "@/store/use-view-store";
// import BoardCanvas from './board-canvas'
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
  edges,
  workspaceId,
  projectId,
  workSlug,
  projectSlug,
}: BoardDisplayProps) {
  const { view } = useViewStore();

  return (
    <div>
      {/* View Toggle */}
      {view === "list" ? (
        <BoardList
          boards={boards}
          workSlug={workSlug}
          projectSlug={projectSlug}
          workspaceId={workspaceId}
          projectId={projectId}
        />
      ) : (
        <div className=""></div>
        // <BoardCanvas
        //     boards={boards}
        //     edges={edges}
        //     workspaceId={workSlug}
        //     projectId={projectSlug}
        // />
      )}
    </div>
  );
}
