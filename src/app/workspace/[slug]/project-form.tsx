"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FolderKanban, Calendar } from "lucide-react";
import { Form, Input, Button, Select, DatePicker, Space, Drawer } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { createProjectAction, updateProjectAction } from "./actions";
import type { Priority, ProjectStatus } from "@/lib/types";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const projectSchema = z
  .object({
    title: z
      .string()
      .min(1, "กรุณาระบุชื่อโปรเจกต์")
      .max(100, "ชื่อโปรเจกต์ต้องไม่เกิน 100 ตัวอักษร"),
    description: z
      .string()
      .min(1, "กรุณาระบุรายละเอียด")
      .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร"),
    status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"], {
      message: "กรุณาเลือกสถานะ",
    }),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
      message: "กรุณาเลือกระดับความสำคัญ",
    }),
    startDate: z.string().min(1, "กรุณาระบุวันที่เริ่มต้น"),
    endDate: z.string().min(1, "กรุณาระบุวันที่สิ้นสุด"),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
    {
      message: "วันที่สิ้นสุดต้องมาหลังวันที่เริ่มต้น",
      path: ["endDate"],
    },
  );

type ProjectFormValues = z.infer<typeof projectSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectData {
  id: string;
  title: string;
  description: string;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  slug: string;
  project?: ProjectData | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectForm({
  open,
  onClose,
  workspaceId,
  slug,
  project,
}: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();

  interface ProjectFormRawValues {
    title: string;
    description: string;
    status: ProjectStatus;
    priority: Priority;
    startDate?: Dayjs | undefined;
    endDate?: Dayjs | undefined;
  }

  function onSubmit(values: ProjectFormRawValues) {
    try {
      // Normalize DatePicker (dayjs) values to ISO strings for validation
      const validationValues = {
        ...values,
        startDate: values.startDate ? dayjs(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? dayjs(values.endDate).toISOString() : undefined,
      };

      projectSchema.parse(validationValues);
      startTransition(async () => {
        const payload = {
          ...values,
          startDate: values.startDate ? dayjs(values.startDate).toDate() : new Date(),
          endDate: values.endDate ? dayjs(values.endDate).toDate() : new Date(),
          workspaceId,
          slug,
        };
        if (isEditing && project) {
          await updateProjectAction({ id: project.id, ...payload });
        } else {
          await createProjectAction(payload);
        }
        router.refresh();
        form.resetFields();
        onClose();
      });
    } catch (error) {
      if (error instanceof z.ZodError && error.issues.length > 0) {
        const fields = error.issues.map((issue) => ({
          name: issue.path[0] as string,
          errors: [issue.message],
        }));
        form.setFields(fields);
      }
    }
  }

  function handleDrawerClose() {
    form.resetFields();
    onClose();
  }

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#1890ff",
              color: "white",
            }}
          >
            <FolderKanban size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
              {isEditing ? "แก้ไขโปรเจกต์" : "สร้างโปรเจกต์ใหม่"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999" }}>
              {isEditing
                ? "แก้ไขข้อมูลและรายละเอียดของโปรเจกต์"
                : "กรอกข้อมูลเพื่อสร้างโปรเจกต์ใหม่"}
            </p>
          </div>
        </div>
      }
      placement="right"
      onClose={handleDrawerClose}
      open={open}
      size={500}
      styles={{
        body: { paddingBottom: "80px" },
      }}
      footer={
        <Space style={{ float: "right", gap: "8px" }}>
          <Button onClick={handleDrawerClose} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            {isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างโปรเจกต์"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          title: project?.title ?? "",
          description: project?.description ?? "",
          status: (project?.status as ProjectStatus) ?? "ACTIVE",
          priority: (project?.priority as Priority) ?? "MEDIUM",
          startDate: project?.startDate ? dayjs(new Date(project.startDate)) : undefined,
          endDate: project?.endDate ? dayjs(new Date(project.endDate)) : undefined,
        }}
      >
        {/* Title */}
        <Form.Item
          label="ชื่อโปรเจกต์ *"
          name="title"
          rules={[
            { required: true, message: "กรุณาระบุชื่อโปรเจกต์" },
            { max: 100, message: "ชื่อโปรเจกต์ต้องไม่เกิน 100 ตัวอักษร" },
          ]}
        >
          <Input placeholder="เช่น Q1 Roadmap, Website Redesign" />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="รายละเอียด *"
          name="description"
          rules={[
            { required: true, message: "กรุณาระบุรายละเอียด" },
            { max: 500, message: "รายละเอียดต้องไม่เกิน 500 ตัวอักษร" },
          ]}
        >
          <Input.TextArea placeholder="เป้าหมายและรายละเอียดของโปรเจกต์นี้..." rows={3} />
        </Form.Item>

        {/* Status + Priority */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Form.Item
            label="สถานะ *"
            name="status"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
          >
            <Select
              options={[
                { label: "🟢 Active", value: "ACTIVE" },
                { label: "🟡 Paused", value: "PAUSED" },
                { label: "✅ Completed", value: "COMPLETED" },
                { label: "🗄️ Archived", value: "ARCHIVED" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="ความสำคัญ *"
            name="priority"
            rules={[{ required: true, message: "กรุณาเลือกความสำคัญ" }]}
          >
            <Select
              options={[
                { label: "🟦 Low", value: "LOW" },
                { label: "🟨 Medium", value: "MEDIUM" },
                { label: "🟧 High", value: "HIGH" },
                { label: "🚨 Urgent", value: "URGENT" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Timeline */}
        <div
          style={{
            borderRadius: "6px",
            border: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: "600",
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Calendar size={14} />
            Project Timeline
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item
              label={<span style={{ fontSize: "12px" }}>วันที่เริ่ม *</span>}
              name="startDate"
              rules={[{ required: true, message: "กรุณาระบุวันที่เริ่มต้น" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontSize: "12px" }}>วันที่สิ้นสุด *</span>}
              name="endDate"
              rules={[{ required: true, message: "กรุณาระบุวันที่สิ้นสุด" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Drawer>
  );
}
