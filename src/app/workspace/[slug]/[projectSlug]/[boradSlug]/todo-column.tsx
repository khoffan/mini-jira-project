"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Tag } from "antd";
import TodoCard from "./todo-card";
import TodoForm from "./todo-form";
import type { ITask, TaskStatus } from "@/lib/types";

interface TodoColumnProps {
  title: string;
  status: TaskStatus;
  todos: ITask[];
  boardId: string;
  color: string;
  icon: React.ReactNode;
}

export default function TodoColumn({ title, todos, boardId, color, icon }: TodoColumnProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<ITask | null>(null);

  function handleEdit(todo: ITask) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTodo(null);
  }

  function handleCreateNew() {
    setEditingTodo(null);
    setShowForm(true);
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "288px",
          flexShrink: 0,
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Column header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: color,
                color: "white",
                fontSize: "12px",
              }}
            >
              {icon}
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>{title}</span>
          </div>
          <Tag>{todos.length}</Tag>
        </div>

        {/* Task list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 220px)",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {todos.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 16px",
                borderRadius: "8px",
                border: "2px dashed #e8e8e8",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>ว่างเปล่า</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} boardId={boardId} onEdit={handleEdit} />
            ))
          )}
        </div>

        {/* Add task button */}
        <div style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}>
          <Button
            type="default"
            size="small"
            icon={<Plus size={14} />}
            block
            onClick={handleCreateNew}
            style={{ color: "#999", height: "32px" }}
          >
            เพิ่มงาน
          </Button>
        </div>
      </div>

      {/* Slide-over form */}
      <TodoForm open={showForm} onClose={handleCloseForm} boardId={boardId} todo={editingTodo} />
    </>
  );
}
