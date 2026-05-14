"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createWorkspaceAction } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, LinkIcon, Lock, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// ─── Schema ───────────────────────────────────────────────────────────────────
const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"),
  description: z
    .string()
    .max(200, "คำอธิบายต้องไม่เกิน 200 ตัวอักษร")
    .optional(),
  allowLinkJoin: z.boolean(),
  isPublic: z.boolean(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

interface WorkspaceCreateFormProps {
  userId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkspaceCreateForm({
  userId,
}: WorkspaceCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      allowLinkJoin: true,
      isPublic: false,
    },
  });

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto mb-3 shadow-lg">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">สร้าง Workspace ใหม่</h1>
          <p className="text-muted-foreground text-sm mt-1">
            พื้นที่สำหรับจัดการโปรเจกต์และทีมของคุณ
          </p>
        </div>

        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-5"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ Workspace *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น My Digital Agency, Startup Project"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>คำอธิบาย</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="บอกรายละเอียดสั้นๆ เกี่ยวกับ Workspace นี้..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Access Settings */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  การตั้งค่าการเข้าถึง
                </p>

                {/* Allow Link Join */}
                <FormField
                  control={form.control}
                  name="allowLinkJoin"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            <LinkIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              เข้าร่วมผ่านลิงก์เชิญ
                            </FormLabel>
                            <FormDescription className="text-xs">
                              ผู้ที่มี Invite Code สามารถเข้าร่วมได้
                            </FormDescription>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                            field.value
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                              field.value ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Is Public */}
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-md ${field.value ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                          >
                            {field.value ? (
                              <Globe className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              Workspace สาธารณะ
                            </FormLabel>
                            <FormDescription className="text-xs">
                              คนในองค์กรค้นหาและดู Workspace นี้ได้
                            </FormDescription>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                            field.value
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                              field.value ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => router.push("/workspace")}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "กำลังสร้าง..." : "เริ่มสร้าง Workspace"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
