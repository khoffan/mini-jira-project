"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Columns3 } from "lucide-react";
import { Form, Input, Button, Space, Drawer } from "antd";
import { createBoardAction, updateBoardAction } from "./actions";
import type { IBoard } from "@/lib/types";

// ─── Preset Colors ─────────────────────────────────────────────────────────
const PRESET_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Violet", value: "#8b5cf6" },
];

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const boardSchema = z.object({
  title: z.string().min(1, "กรุณาระบุชื่อ board").max(80, "ชื่อ board ต้องไม่เกิน 80 ตัวอักษร"),
  description: z.string().max(300, "รายละเอียดต้องไม่เกิน 300 ตัวอักษร").optional(),
  color: z.string().min(1, "กรุณาเลือกสี"),
});

type BoardFormValues = z.infer<typeof boardSchema>;

// ─── Props ──────────────────────────────────────────────────────────────────
interface BoardFormProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId: string;
  workspaceSlug: string;
  projectSlug: string;
  board?: Partial<IBoard> | null;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function BoardForm({
  open,
  onClose,
  workspaceId,
  projectId,
  workspaceSlug,
  projectSlug,
  board,
}: BoardFormProps) {
  const router = useRouter();
  const isEditing = !!board;
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();

  const watchedColor = form.getFieldValue("color") || "#6366f1";

  function onSubmit(values: BoardFormValues) {
    try {
      boardSchema.parse(values);
      startTransition(async () => {
        if (isEditing && board?.id) {
          await updateBoardAction({
            id: board.id,
            title: values.title,
            description: values.description,
            color: values.color,
            workspaceSlug,
            projectSlug,
          });
        } else {
          await createBoardAction({
            title: values.title,
            description: values.description,
            color: values.color,
            projectId,
            workspaceId,
          });
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
              backgroundColor: watchedColor,
              color: "white",
            }}
          >
            <Columns3 size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
              {isEditing ? "แก้ไข Board" : "สร้าง Board ใหม่"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999" }}>
              {isEditing ? "แก้ไขข้อมูลของ board" : "เพิ่ม board ใหม่ในโปรเจกต์นี้"}
            </p>
          </div>
        </div>
      }
      placement="right"
      onClose={handleDrawerClose}
      open={open}
      size={400}
      styles={{
        body: { paddingBottom: "80px" },
      }}
      footer={
        <Space style={{ float: "right", gap: "8px" }}>
          <Button onClick={handleDrawerClose} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            {isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้าง Board"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          title: board?.title ?? "",
          description: board?.description ?? "",
          color: board?.color ?? "#6366f1",
        }}
      >
        {/* Title */}
        <Form.Item
          label="ชื่อ Board *"
          name="title"
          rules={[
            { required: true, message: "กรุณาระบุชื่อ board" },
            { max: 80, message: "ชื่อ board ต้องไม่เกิน 80 ตัวอักษร" },
          ]}
        >
          <Input placeholder="เช่น Sprint 1, Backlog, Design Review" autoFocus />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="รายละเอียด"
          name="description"
          rules={[{ max: 300, message: "รายละเอียดต้องไม่เกิน 300 ตัวอักษร" }]}
        >
          <Input.TextArea placeholder="board นี้ใช้สำหรับ..." rows={2} />
        </Form.Item>

        {/* Color picker */}
        <Form.Item
          label="สีประจำ Board"
          name="color"
          rules={[{ required: true, message: "กรุณาเลือกสี" }]}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c.value}
                onClick={() => form.setFieldValue("color", c.value)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: c.value,
                  border: watchedColor === c.value ? "3px solid #1890ff" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title={c.name}
              />
            ))}
            {/* Custom color */}
            <input
              type="color"
              value={watchedColor}
              onChange={(e) => form.setFieldValue("color", e.target.value)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "2px solid #d9d9d9",
                padding: 0,
                cursor: "pointer",
              }}
              title="สีกำหนดเอง"
            />
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
