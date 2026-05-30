"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Calendar, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Tag, Empty, Space } from "antd";
import ProjectForm from "./project-form";
import { deleteProjectAction } from "./actions";
import type { INestedProject, ProjectStatus, Priority } from "@/lib/types";

interface ProjectListProps {
  projects: INestedProject[];
  workspaceId: string;
  slug: string;
}

const accentColors = ["#4f46e5", "#a855f7", "#06b6d4", "#10b981", "#f43f5e", "#f59e0b"];

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "blue" },
  PAUSED: { label: "Paused", color: "orange" },
  COMPLETED: { label: "Completed", color: "green" },
  ARCHIVED: { label: "Archived", color: "default" },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "cyan" },
  MEDIUM: { label: "Medium", color: "orange" },
  HIGH: { label: "High", color: "volcano" },
  URGENT: { label: "Urgent", color: "red" },
};

export default function ProjectList({ projects, workspaceId, slug }: ProjectListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<INestedProject | null>(null);
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>โปรเจกต์</h1>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "4px" }}>
            {projects.length > 0 ? `${projects.length} โปรเจกต์` : "ยังไม่มีโปรเจกต์"}
          </p>
        </div>
        <Button type="primary" icon={<Plus size={14} />} onClick={handleCreate}>
          สร้างโปรเจกต์
        </Button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <Empty description="ยังไม่มีโปรเจกต์" style={{ marginTop: "80px" }}>
          <Button type="primary" icon={<Plus size={14} />} onClick={handleCreate}>
            สร้างโปรเจกต์แรก
          </Button>
        </Empty>
      ) : (
        /* Project Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {projects.map((project, i) => {
            const status = statusConfig[project.status];
            const priority = priorityConfig[project.priority];
            const accent = accentColors[i % accentColors.length];

            return (
              <Card key={project.id} style={{ borderTop: `3px solid ${accent}` }} hoverable>
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
                          backgroundColor: accent,
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <Link
                        href={`/workspace/${slug}/${project.slug}`}
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
                        {project.title}
                      </Link>
                    </div>

                    {/* Actions (show always) */}
                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<Pencil size={14} />}
                        onClick={() => handleEdit(project)}
                        title="แก้ไข"
                        style={{ padding: "0 4px" }}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDelete(project.id, project.title)}
                        loading={deletingId === project.id}
                        title="ลบ"
                        style={{ padding: "0 4px" }}
                      />
                    </Space>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                  {/* Tags section */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
                  >
                    <Tag color={status.color}>{status.label}</Tag>
                    <Tag color={priority.color}>{priority.label}</Tag>
                  </div>

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
                      {new Date(project.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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
                      <Layers size={12} />
                      {project.boards.length} board
                    </span>
                  </div>
                </div>
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
