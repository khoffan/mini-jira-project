"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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

export default function TodoColumn({
  title,
  status,
  todos,
  boardId,
  color,
  icon,
}: TodoColumnProps) {
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
      <div className="flex flex-col w-72 shrink-0 rounded-xl border bg-muted/30">
        {/* Column header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-white text-xs"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {todos.length}
          </Badge>
        </div>

        {/* Task list */}
        <ScrollArea className="flex-1 max-h-[calc(100vh-220px)]">
          <div className="p-2 space-y-2">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground">ว่างเปล่า</p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  boardId={boardId}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Add task button */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5 h-8 text-muted-foreground hover:text-foreground"
            onClick={handleCreateNew}
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มงาน
          </Button>
        </div>
      </div>

      {/* Slide-over form */}
      <TodoForm
        open={showForm}
        onClose={handleCloseForm}
        boardId={boardId}
        todo={editingTodo}
      />
    </>
  );
}
