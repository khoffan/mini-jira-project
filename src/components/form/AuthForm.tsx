"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, "กรุณาระบุอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

const signupSchema = z.object({
  name: z.string().max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร").optional(),
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

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

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
  function onLogin(values: LoginValues) {
    startTransition(async () => {
      try {
        const result = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password,
        );
        const u = result.user;
        await handleAuthSuccess(u.uid, u.email!, u.displayName, u.photoURL);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
        loginForm.setError("password", {
          message: message.includes("invalid-credential")
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
      }
    });
  }

  /** ─── Signup ─── */
  function onSignup(values: SignupValues) {
    startTransition(async () => {
      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password,
        );
        const u = result.user;
        if (values.name) await updateProfile(u, { displayName: values.name });
        await handleAuthSuccess(u.uid, u.email!, values.name || null, null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ";
        signupForm.setError("email", {
          message: message.includes("email-already-in-use")
            ? "อีเมลนี้ถูกใช้งานแล้ว"
            : "เกิดข้อผิดพลาด กรุณาลองใหม่",
        });
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
        const message =
          err instanceof Error ? err.message : "Google Sign-In ไม่สำเร็จ";
        if (!message.includes("popup-closed")) toast.error(message);
      }
    });
  };

  const toggleMode = () => {
    setIsSignup((v) => !v);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto mb-3 shadow-lg">
            <span className="font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-bold">Mini-Jira</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSignup ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบจัดการโปรเจกต์"}
          </p>
        </div>

        {/* Google Sign-In */}
        <Button
          variant="outline"
          className="w-full gap-2 mb-4"
          onClick={handleGoogleSignIn}
          disabled={isPending}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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

        <div className="relative mb-4">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            หรือ
          </span>
        </div>

        {/* Login Form */}
        {!isSignup && (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>
        )}

        {/* Signup Form */}
        {isSignup && (
          <Form {...signupForm}>
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4"
            >
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ (ไม่บังคับ)</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อของคุณ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
              </Button>
            </form>
          </Form>
        )}

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignup ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary font-semibold hover:underline"
          >
            {isSignup ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </p>
      </div>
    </div>
  );
}
