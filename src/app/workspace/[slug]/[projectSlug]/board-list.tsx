"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ListChecks,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import BoardForm from "./board-form";
import { deleteBoardAction } from "./actions";
import type { INestedBoard } from "@/lib/types";

interface BoardListProps {
  boards: INestedBoard[];
  workspaceId: string;
  projectId: string;
  workSlug: string;
  projectSlug: string;
}

export default function BoardList({
  boards,
  workspaceId,
  projectId,
  workSlug,
  projectSlug,
}: BoardListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<INestedBoard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate() {
    setEditingBoard(null);
    setShowForm(true);
  }

  function handleEdit(board: INestedBoard) {
    setEditingBoard(board);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingBoard(null);
  }

  async function handleDelete(boardId: string, boardTitle: string) {
    if (
      !confirm(
        `ยืนยันการลบ board "${boardTitle}"?\nการลบจะลบ task ทั้งหมดใน board นี้`,
      )
    )
      return;
    setDeletingId(boardId);
    try {
      await deleteBoardAction({
        id: boardId,
        workspaceSlug: workSlug,
        projectSlug,
      });
      toast.success("ลบ board เรียบร้อยแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบ board");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Boards</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {boards.length > 0 ? `${boards.length} board` : "ยังไม่มี board"}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          สร้าง Board
        </Button>
      </div>

      {/* Empty state */}
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Columns3 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">ยังไม่มี board</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            สร้าง board เพื่อเริ่มจัดการ task ในโปรเจกต์นี้
          </p>
          <Button onClick={handleCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            สร้าง Board แรก
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="group relative overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: board.color ?? "#6366f1" }}
              />

              <CardHeader className="pb-2 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: board.color ?? "#6366f1" }}
                    >
                      {board.title.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-base truncate">
                      <Link
                        href={`/workspace/${workSlug}/${projectSlug}/${board.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {board.title}
                      </Link>
                    </CardTitle>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(board)}
                      title="แก้ไข"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(board.id, board.title)}
                      disabled={deletingId === board.id}
                      title="ลบ"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {board.description && (
                  <CardDescription className="text-xs mt-1 line-clamp-1">
                    {board.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardFooter className="pt-3 border-t text-xs text-muted-foreground gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(board.createdAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <ListChecks className="h-3 w-3" />
                  {board.tasks.length} task
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Slide-over form */}
      <BoardForm
        open={showForm}
        onClose={handleCloseForm}
        workspaceId={workspaceId}
        projectId={projectId}
        workspaceSlug={workSlug}
        projectSlug={projectSlug}
        board={editingBoard}
      />
    </>
  );
}
