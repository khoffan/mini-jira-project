"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ProjectForm from "./project-form";
import { deleteProjectAction } from "./actions";
import type { INestedProject, ProjectStatus, Priority } from "@/lib/types";

interface ProjectListProps {
  projects: INestedProject[];
  workspaceId: string;
  slug: string;
}

const accentColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
];

const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ACTIVE: { label: "Active", variant: "default" },
  PAUSED: { label: "Paused", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "outline" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-sky-600" },
  MEDIUM: { label: "Medium", color: "text-amber-600" },
  HIGH: { label: "High", color: "text-orange-600" },
  URGENT: { label: "Urgent", color: "text-red-600" },
};

export default function ProjectList({
  projects,
  workspaceId,
  slug,
}: ProjectListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<INestedProject | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate() {
    setEditingProject(null);
    setShowForm(true);
  }

  function handleEdit(project: INestedProject) {
    setEditingProject(project);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingProject(null);
  }

  async function handleDelete(projectId: string, projectTitle: string) {
    if (
      !confirm(
        `ยืนยันการลบโปรเจกต์ "${projectTitle}"?\nการลบจะลบ board และ task ทั้งหมดในโปรเจกต์นี้`,
      )
    )
      return;
    setDeletingId(projectId);
    try {
      await deleteProjectAction({ id: projectId, workspaceId });
      toast.success("ลบโปรเจกต์เรียบร้อยแล้ว");
      router.refresh();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบโปรเจกต์");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">โปรเจกต์</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projects.length > 0
              ? `${projects.length} โปรเจกต์`
              : "ยังไม่มีโปรเจกต์"}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          สร้างโปรเจกต์
        </Button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">ยังไม่มีโปรเจกต์</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            สร้างโปรเจกต์แรกของคุณเพื่อเริ่มจัดการ board และ task
          </p>
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            สร้างโปรเจกต์แรก
          </Button>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const status = statusConfig[project.status];
            const priority = priorityConfig[project.priority];
            const accent = accentColors[i % accentColors.length];

            return (
              <Card
                key={project.id}
                className="group relative overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`}
                />

                <CardHeader className="pb-2 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent} text-white text-sm font-bold`}
                      >
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <CardTitle className="text-base leading-snug truncate">
                        <Link
                          href={`/workspace/${slug}/${project.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {project.title}
                        </Link>
                      </CardTitle>
                    </div>

                    {/* Actions (show on hover) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(project)}
                        title="แก้ไข"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={deletingId === project.id}
                        title="ลบ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <CardDescription className="line-clamp-2 text-xs mt-1">
                    {project.description || "ไม่มีรายละเอียด"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={status.variant} className="text-[11px] h-5">
                      {status.label}
                    </Badge>
                    <span
                      className={`text-[11px] font-medium ${priority.color}`}
                    >
                      {priority.label}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t text-xs text-muted-foreground gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Layers className="h-3 w-3" />
                    {project.boards.length} board
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Slide-over form */}
      <ProjectForm
        open={showForm}
        onClose={handleCloseForm}
        workspaceId={workspaceId}
        slug={slug}
        project={editingProject}
      />
    </>
  );
}
