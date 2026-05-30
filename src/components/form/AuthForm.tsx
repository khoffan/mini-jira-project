"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-config";
import { createUserInDB } from "@/app/login/actions";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form, Input, Button, Divider, Spin } from "antd";

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, "กรุณาระบุอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

const signupSchema = z.object({
  name: z.string().max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร").optional().or(z.literal("")),
  email: z.string().min(1, "กรุณาระบุอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .max(72, "รหัสผ่านต้องไม่เกิน 72 ตัวอักษร"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loginForm] = Form.useForm<LoginValues>();
  const [signupForm] = Form.useForm<SignupValues>();

  /** ─── Helper: sync Firebase user → Zustand + MongoDB ─── */
  const handleAuthSuccess = async (
    uid: string,
    userEmail: string,
    displayName?: string | null,
    photoURL?: string | null,
  ) => {
    document.cookie = `firebase-uid=${uid}; path=/; max-age=86400; SameSite=Lax`;
    const result = await createUserInDB({
      uid,
      email: userEmail,
      name: displayName,
      image: photoURL,
    });
    if (!result.success) {
      toast.error("เข้าสู่ระบบสำเร็จ แต่บันทึกฐานข้อมูลไม่ได้");
    }
    setUser({
      uid,
      email: userEmail,
      name: displayName ?? "",
      image: photoURL ?? "",
    });
    toast.success("เข้าสู่ระบบสำเร็จ!");
    router.push("/workspace");
  };

  /** ─── Login ─── */
  async function onLogin(values: LoginValues) {
    startTransition(async () => {
      try {
        const result = await signInWithEmailAndPassword(auth, values.email, values.password);
        const u = result.user;
        await handleAuthSuccess(u.uid, u.email!, u.displayName, u.photoURL);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
        const errorMsg = message.includes("invalid-credential")
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : "เกิดข้อผิดพลาด กรุณาลองใหม่";
        loginForm.setFields([
          {
            name: "password",
            errors: [errorMsg],
          },
        ]);
        toast.error(errorMsg);
      }
    });
  }

  /** ─── Signup ─── */
  async function onSignup(values: SignupValues) {
    startTransition(async () => {
      try {
        const result = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const u = result.user;
        if (values.name) await updateProfile(u, { displayName: values.name });
        await handleAuthSuccess(u.uid, u.email!, values.name || null, null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ";
        const errorMsg = message.includes("email-already-in-use")
          ? "อีเมลนี้ถูกใช้งานแล้ว"
          : "เกิดข้อผิดพลาด กรุณาลองใหม่";
        signupForm.setFields([
          {
            name: "email",
            errors: [errorMsg],
          },
        ]);
        toast.error(errorMsg);
      }
    });
  }

  /** ─── Google Sign-In ─── */
  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const u = result.user;
        await handleAuthSuccess(u.uid, u.email!, u.displayName, u.photoURL);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Google Sign-In ไม่สำเร็จ";
        if (!message.includes("popup-closed")) toast.error(message);
      }
    });
  };

  const toggleMode = () => {
    setIsSignup((v) => !v);
    loginForm.resetFields();
    signupForm.resetFields();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "#fafafa",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo + Title */}
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
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 8px" }}>Mini-Jira</h1>
          <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
            {isSignup ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบจัดการโปรเจกต์"}
          </p>
        </div>

        {/* Google Sign-In */}
        <Button
          block
          style={{ height: "36px", marginBottom: "16px", fontSize: "14px" }}
          onClick={handleGoogleSignIn}
          disabled={isPending}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ width: "16px", height: "16px", marginRight: "8px" }}
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          ดำเนินการต่อด้วย Google
        </Button>

        <Divider style={{ margin: "16px 0" }}>หรือ</Divider>

        {/* Login Form */}
        {!isSignup && (
          <Spin spinning={isPending}>
            <Form form={loginForm} layout="vertical" onFinish={onLogin} autoComplete="off">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "กรุณาระบุอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input placeholder="name@company.com" type="email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "กรุณาระบุรหัสผ่าน" },
                  { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                ]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <Button
                type="primary"
                block
                htmlType="submit"
                disabled={isPending}
                style={{ height: "36px" }}
              >
                {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </Form>
          </Spin>
        )}

        {/* Signup Form */}
        {isSignup && (
          <Spin spinning={isPending}>
            <Form form={signupForm} layout="vertical" onFinish={onSignup} autoComplete="off">
              <Form.Item
                name="name"
                label="ชื่อ (ไม่บังคับ)"
                rules={[{ max: 50, message: "ชื่อต้องไม่เกิน 50 ตัวอักษร" }]}
              >
                <Input placeholder="ชื่อของคุณ" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email *"
                rules={[
                  { required: true, message: "กรุณาระบุอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input placeholder="name@company.com" type="email" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password *"
                rules={[
                  { required: true, message: "กรุณาระบุรหัสผ่าน" },
                  { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                  { max: 72, message: "รหัสผ่านต้องไม่เกิน 72 ตัวอักษร" },
                ]}
              >
                <Input.Password placeholder="อย่างน้อย 6 ตัวอักษร" />
              </Form.Item>

              <Button
                type="primary"
                block
                htmlType="submit"
                disabled={isPending}
                style={{ height: "36px" }}
              >
                {isPending ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
              </Button>
            </Form>
          </Spin>
        )}

        {/* Toggle */}
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#999",
            marginTop: "16px",
          }}
        >
          {isSignup ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            style={{
              color: "#1890ff",
              fontWeight: "600",
              border: "none",
              background: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isSignup ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </p>
      </div>
    </div>
  );
}
