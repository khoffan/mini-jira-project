"use client";
import { useState, useEffect } from "react";
import { type IUser } from "@/lib/types";
import { updateProfileAction } from "./actions";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Form, Input, Button, Avatar, message, Space } from "antd";

export default function AccountForm({ user }: { user: IUser | null }) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<{
    fullname?: string;
    username?: string;
    website?: string;
    avatar_url?: string;
  }>();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullname: user.name ?? "",
        avatar_url: user.image ?? "",
      });
    }
  }, [user, form]);

  async function handleFinish(values: any) {
    try {
      setLoading(true);
      await updateProfileAction({
        userId: user?.uid as string,
        fullname: values.fullname || null,
        username: values.username || null,
        website: values.website || null,
        avatar_url: values.avatar_url || null,
      });
      message.success("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (err) {
      message.error("เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 24, borderBottom: "1px solid #e6e6e6", paddingBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>จัดการบัญชีผู้ใช้</h1>
        <p style={{ color: "rgba(0,0,0,0.45)" }}>แก้ไขข้อมูลส่วนตัวและการตั้งค่าโปรไฟล์ของคุณ</p>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: "0 0 200px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>ข้อมูลส่วนตัว</h2>
          <p style={{ color: "rgba(0,0,0,0.45)", marginTop: 8 }}>
            ชื่อและข้อมูลนี้จะปรากฏให้คนอื่นเห็นเมื่อคุณทำงานร่วมกันในบอร์ด
          </p>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            border: "1px solid #f0f0f0",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item label="อีเมล">
              <Input value={user?.email ?? ""} disabled />
            </Form.Item>

            <Form.Item label="ชื่อ-นามสกุล" name="fullname">
              <Input placeholder="ระบุชื่อจริงของคุณ" />
            </Form.Item>

            <Form.Item label="ชื่อผู้ใช้ (Username)" name="username">
              <Input placeholder="example_user" />
            </Form.Item>

            <Form.Item label="เว็บไซต์" name="website">
              <Input placeholder="https://yourwebsite.com" />
            </Form.Item>

            <Form.Item label="Avatar URL" name="avatar_url">
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  danger
                  onClick={async () => {
                    clearAuth();
                    document.cookie = "firebase-uid=; path=/; max-age=0";
                    await signOut(auth);
                    router.push("/login");
                  }}
                >
                  ออกจากระบบ
                </Button>

                <Button type="primary" htmlType="submit" loading={loading}>
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
