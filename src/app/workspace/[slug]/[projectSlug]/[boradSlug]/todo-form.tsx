"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CheckSquare, Clock } from "lucide-react";
import { Form, Input, Button, Select, DatePicker, Space } from "antd";
import MaterialModal from "@/components/modal/MaterialModal";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { createTodoAction, updateTodoAction } from "./actions";
import type { Priority, ITask, TaskStatus } from "@/lib/types";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const todoSchema = z.object({
  title: z.string().min(1, "กรุณาระบุหัวข้องาน").max(150, "หัวข้องานต้องไม่เกิน 150 ตัวอักษร"),
  description: z.string().max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"], {
    message: "กรุณาเลือกสถานะ",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    message: "กรุณาเลือกระดับความสำคัญ",
  }),
  dueDate: z.string().optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  todo?: Partial<ITask> | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TodoForm({ open, onClose, boardId, todo }: TodoFormProps) {
  const router = useRouter();
  const isEditing = !!todo;
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm();

  interface TodoFormRawValues {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: Dayjs | undefined;
  }

  function onSubmit(values: TodoFormRawValues) {
    try {
      // Normalize DatePicker (dayjs) value to ISO string for validation
      const validationValues = {
        ...values,
        dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : undefined,
      };

      todoSchema.parse(validationValues);
      startTransition(async () => {
        const payload = {
          title: values.title,
          description: values.description,
          status: values.status as TaskStatus,
          priority: values.priority as Priority,
          dueDate: values.dueDate ? dayjs(values.dueDate).toDate() : null,
          boardId,
        };

        if (isEditing && todo?.id) {
          await updateTodoAction({ id: todo.id, ...payload });
        } else {
          await createTodoAction(payload);
        }
        router.refresh();
        form.resetFields();
        onClose();
      });
    } catch (error) {
      if (error instanceof z.ZodError && error.issues.length > 0) {
        const first = error.issues[0];
        form.setFields([
          {
            name: first.path[0] as string,
            errors: [first.message],
          },
        ]);
      } else if (error instanceof Error) {
        // use error.message as a readable fallback
        console.error("Todo submit error:", error.message);
      }
    }
  }

  function handleDrawerClose() {
    form.resetFields();
    onClose();
  }

  return (
    <MaterialModal
      open={open}
      onClose={handleDrawerClose}
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
            <CheckSquare size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
              {isEditing ? "แก้ไขงาน" : "สร้างงานใหม่"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#999" }}>
              {isEditing ? "แก้ไขรายละเอียดของงานนี้" : "เพิ่มงานใหม่เข้าใน board"}
            </p>
          </div>
        </div>
      }
      footer={
        <Space style={{ float: "right", gap: "8px" }}>
          <Button onClick={handleDrawerClose} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            {isEditing ? "บันทึกการเปลี่ยนแปลง" : "สร้างงาน"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          title: todo?.title ?? "",
          description: todo?.description ?? "",
          status: (todo?.status as TaskStatus) ?? "TODO",
          priority: (todo?.priority as Priority) ?? "MEDIUM",
          dueDate: todo?.dueDate ? dayjs(new Date(todo.dueDate)) : undefined,
        }}
      >
        {/* Title */}
        <Form.Item
          label="หัวข้องาน *"
          name="title"
          rules={[
            { required: true, message: "กรุณาระบุหัวข้องาน" },
            { max: 150, message: "หัวข้องานต้องไม่เกิน 150 ตัวอักษร" },
          ]}
        >
          <Input placeholder="เช่น ออกแบบหน้า Dashboard" autoFocus />
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
                { label: "📋 To Do", value: "TODO" },
                { label: "🔄 In Progress", value: "IN_PROGRESS" },
                { label: "✅ Done", value: "DONE" },
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

        {/* Due Date */}
        <Form.Item
          label={
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={14} />
              กำหนดส่ง
            </span>
          }
          name="dueDate"
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="รายละเอียด"
          name="description"
          rules={[{ max: 500, message: "รายละเอียดต้องไม่เกิน 500 ตัวอักษร" }]}
        >
          <Input.TextArea placeholder="รายละเอียดเพิ่มเติมของงานนี้..." rows={4} />
        </Form.Item>
      </Form>
    </MaterialModal>
  );
}
