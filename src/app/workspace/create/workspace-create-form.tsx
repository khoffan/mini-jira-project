"use client";

import { useTransition } from "react";
import { z } from "zod";
import { createWorkspaceAction } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Form, Input, Button, Space, Card, Checkbox, Divider, Spin } from "antd";
import { toast } from "sonner";

// ─── Schema ───────────────────────────────────────────────────────────────────
const workspaceSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"),
  description: z.string().max(200, "คำอธิบายต้องไม่เกิน 200 ตัวอักษร").optional(),
  allowLinkJoin: z.boolean(),
  isPublic: z.boolean(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

interface WorkspaceCreateFormProps {
  userId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkspaceCreateForm({ userId }: WorkspaceCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form] = Form.useForm<WorkspaceFormValues>();

  function onSubmit(values: WorkspaceFormValues) {
    startTransition(async () => {
      const result = await createWorkspaceAction({
        ...values,
        ownerId: userId,
      });
      if (result.success && result.workspace) {
        toast.success("สร้าง Workspace เรียบร้อยแล้ว!");
        router.push(`/workspace/${result.workspace.slug}`);
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาดในการสร้าง Workspace");
      }
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 16px 40px",
        background: "#fafafa",
      }}
    >
      <div style={{ width: "100%", maxWidth: "448px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#1890ff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <LayoutGrid size={24} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px" }}>
            สร้าง Workspace ใหม่
          </h1>
          <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
            พื้นที่สำหรับจัดการโปรเจกต์และทีมของคุณ
          </p>
        </div>

        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Spin spinning={isPending}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmit}
              autoComplete="off"
              initialValues={{
                allowLinkJoin: true,
                isPublic: false,
              }}
            >
              {/* Name */}
              <Form.Item
                name="name"
                label="ชื่อ Workspace *"
                rules={[
                  { required: true, message: "กรุณาระบุชื่อ Workspace" },
                  { min: 2, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" },
                  { max: 50, message: "ชื่อต้องไม่เกิน 50 ตัวอักษร" },
                ]}
              >
                <Input placeholder="เช่น My Digital Agency, Startup Project" autoFocus />
              </Form.Item>

              {/* Description */}
              <Form.Item
                name="description"
                label="คำอธิบาย"
                rules={[{ max: 200, message: "คำอธิบายต้องไม่เกิน 200 ตัวอักษร" }]}
              >
                <Input.TextArea
                  placeholder="บอกรายละเอียดสั้นๆ เกี่ยวกับ Workspace นี้..."
                  rows={3}
                />
              </Form.Item>

              <Divider />

              {/* Access Settings */}
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#999",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                    letterSpacing: "0.5px",
                  }}
                >
                  การตั้งค่าการเข้าถึง
                </p>

                {/* Allow Link Join */}
                <Form.Item
                  name="allowLinkJoin"
                  valuePropName="checked"
                  style={{ marginBottom: "12px" }}
                >
                  <Checkbox style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginLeft: "8px" }}>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>
                        เข้าร่วมผ่านลิงก์เชิญ
                      </div>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        ผู้ที่มี Invite Code สามารถเข้าร่วมได้
                      </div>
                    </div>
                  </Checkbox>
                </Form.Item>

                {/* Is Public */}
                <Form.Item name="isPublic" valuePropName="checked" style={{ marginBottom: "0" }}>
                  <Checkbox style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginLeft: "8px" }}>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>Workspace สาธารณะ</div>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        คนในองค์กรค้นหาและดู Workspace นี้ได้
                      </div>
                    </div>
                  </Checkbox>
                </Form.Item>
              </div>

              {/* Footer */}
              <Form.Item style={{ marginBottom: "0" }}>
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  <Button onClick={() => router.push("/workspace")} disabled={isPending}>
                    ยกเลิก
                  </Button>
                  <Button type="primary" htmlType="submit" disabled={isPending}>
                    {isPending ? "กำลังสร้าง..." : "เริ่มสร้าง Workspace"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Card>

        {/* Footer link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            href="/workspace"
            style={{
              color: "#1890ff",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← กลับไปยังหน้า Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
