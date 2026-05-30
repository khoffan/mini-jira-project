"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "antd";
import MaterialModal from "@/components/modal/MaterialModal";
import { updateTodoStatusAction, deleteTodoAction } from "./actions";
import type { ITask, TaskStatus, Priority } from "@/lib/types";

interface TodoCardProps {
  todo: ITask;
  boardId: string;
  onEdit: (todo: ITask) => void;
}

const statusFlow: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

const statusLabel: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "text-sky-600 bg-sky-50" },
  MEDIUM: { label: "Medium", className: "text-amber-600 bg-amber-50" },
  HIGH: { label: "High", className: "text-orange-600 bg-orange-50" },
  URGENT: { label: "Urgent", className: "text-red-600 bg-red-50" },
};

export default function TodoCard({ todo, boardId, onEdit }: TodoCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  async function handleAdvanceStatus() {
    const nextStatus = statusFlow[todo.status as TaskStatus];
    setLoading(true);
    try {
      await updateTodoStatusAction({
        id: todo.id,
        status: nextStatus,
        boardId,
      });
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${err.message}`);
      } else {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("ยืนยันการลบงานนี้?")) return;
    setLoading(true);
    try {
      await deleteTodoAction({ id: todo.id, boardId });
      toast.success("ลบงานเรียบร้อยแล้ว");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`เกิดข้อผิดพลาดในการลบงาน: ${err.message}`);
      } else {
        toast.error("เกิดข้อผิดพลาดในการลบงาน");
      }
    } finally {
      setLoading(false);
    }
  }

  const priority = priorityConfig[todo.priority as Priority] ?? priorityConfig.MEDIUM;
  const nextStatus = statusFlow[todo.status as TaskStatus];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => e.key === "Enter" && setShowDetail(true)}
        className="cursor-pointer"
      >
        <Card
          className={`group transition-shadow hover:shadow-md ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="p-3 space-y-2">
            {/* Title */}
            <p className="text-sm font-medium leading-snug line-clamp-2">{todo.title}</p>

            {/* Description */}
            {todo.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{todo.description}</p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priority.className}`}
              >
                {priority.label}
              </span>
              {todo.dueDate && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(todo.dueDate).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 border-t">
              {/* Advance status */}
              {todo.status !== "DONE" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceStatus();
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  {statusLabel[nextStatus]}
                </button>
              )}
              {todo.status === "DONE" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceStatus();
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ↩ To Do
                </button>
              )}

              {/* Edit + Delete */}
              <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="h-6 w-6 inline-flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(todo);
                  }}
                  title="แก้ไข"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  className="h-6 w-6 inline-flex items-center justify-center text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  title="ลบ"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <MaterialModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={todo.title}
        footer={
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-primary text-white"
              onClick={() => {
                setShowDetail(false);
                onEdit(todo);
              }}
            >
              แก้ไข
            </button>
            <button className="px-3 py-1 rounded border" onClick={() => setShowDetail(false)}>
              ปิด
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm font-medium">{todo.title}</p>
          {todo.description && <p className="text-sm text-muted-foreground">{todo.description}</p>}
          <div className="flex gap-2 items-center">
            <span className={`text-[12px] px-2 py-0.5 rounded ${priority.className}`}>
              {priority.label}
            </span>
            {todo.dueDate && (
              <span className="text-[12px] text-muted-foreground">
                <Calendar className="inline-block mr-1" />
                {new Date(todo.dueDate).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>
      </MaterialModal>
    </>
  );
}
