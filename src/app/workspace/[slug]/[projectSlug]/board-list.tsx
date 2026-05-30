"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Calendar, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Empty, Space } from "antd";
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
    if (!confirm(`ยืนยันการลบ board "${boardTitle}"?\nการลบจะลบ task ทั้งหมดใน board นี้`)) return;
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Boards</h2>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "4px" }}>
            {boards.length > 0 ? `${boards.length} board` : "ยังไม่มี board"}
          </p>
        </div>
        <Button type="primary" size="small" icon={<Plus size={14} />} onClick={handleCreate}>
          สร้าง Board
        </Button>
      </div>

      {/* Empty state */}
      {boards.length === 0 ? (
        <Empty description="ยังไม่มี board" style={{ marginTop: "64px" }}>
          <Button type="primary" size="small" icon={<Plus size={14} />} onClick={handleCreate}>
            สร้าง Board แรก
          </Button>
        </Empty>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {boards.map((board) => (
            <Card
              key={board.id}
              style={{ borderTop: `3px solid ${board.color ?? "#6366f1"}` }}
              hoverable
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Title section */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        backgroundColor: board.color ?? "#6366f1",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {board.title.charAt(0).toUpperCase()}
                    </div>
                    <Link
                      href={`/workspace/${workSlug}/${projectSlug}/${board.slug}`}
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "none",
                        color: "inherit",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {board.title}
                    </Link>
                  </div>

                  {/* Actions */}
                  <Space size={4}>
                    <Button
                      type="text"
                      size="small"
                      icon={<Pencil size={14} />}
                      onClick={() => handleEdit(board)}
                      title="แก้ไข"
                      style={{ padding: "0 4px" }}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDelete(board.id, board.title)}
                      loading={deletingId === board.id}
                      title="ลบ"
                      style={{ padding: "0 4px" }}
                    />
                  </Space>
                </div>

                {/* Description */}
                {board.description && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {board.description}
                  </p>
                )}

                {/* Footer info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f0f0f0",
                    fontSize: "12px",
                    color: "#999",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={12} />
                    {new Date(board.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginLeft: "auto",
                    }}
                  >
                    <ListChecks size={12} />
                    {board.tasks.length} task
                  </span>
                </div>
              </div>
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
