"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FolderKanban, Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
      !data.startDate ||
      !data.endDate ||
      new Date(data.startDate) <= new Date(data.endDate),
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

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      status: (project?.status as ProjectStatus) ?? "ACTIVE",
      priority: (project?.priority as Priority) ?? "MEDIUM",
      startDate: project?.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project?.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
    },
  });

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      const payload = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        workspaceId,
        slug,
      };
      if (isEditing && project) {
        await updateProjectAction({ id: project.id, ...payload });
      } else {
        await createProjectAction(payload);
      }
      router.refresh();
      onClose();
    });
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
      onClose();
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>
                {isEditing ? "แก้ไขโปรเจกต์" : "สร้างโปรเจกต์ใหม่"}
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "แก้ไขข้อมูลและรายละเอียดของโปรเจกต์"
                  : "กรอกข้อมูลเพื่อสร้างโปรเจกต์ใหม่"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อโปรเจกต์ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น Q1 Roadmap, Website Redesign"
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
                    <FormLabel>รายละเอียด *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="เป้าหมายและรายละเอียดของโปรเจกต์นี้..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สถานะ *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกสถานะ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">🟢 Active</SelectItem>
                            <SelectItem value="PAUSED">🟡 Paused</SelectItem>
                            <SelectItem value="COMPLETED">
                              ✅ Completed
                            </SelectItem>
                            <SelectItem value="ARCHIVED">
                              🗄️ Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ความสำคัญ *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกความสำคัญ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">🟦 Low</SelectItem>
                            <SelectItem value="MEDIUM">🟨 Medium</SelectItem>
                            <SelectItem value="HIGH">🟧 High</SelectItem>
                            <SelectItem value="URGENT">🚨 Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Timeline */}
              <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Project Timeline
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">วันที่เริ่ม *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          วันที่สิ้นสุด *
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "กำลังบันทึก..."
                  : isEditing
                    ? "บันทึกการเปลี่ยนแปลง"
                    : "สร้างโปรเจกต์"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
