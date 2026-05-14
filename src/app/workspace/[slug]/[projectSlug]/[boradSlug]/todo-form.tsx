"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CheckSquare, Clock } from "lucide-react";
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
import { createTodoAction, updateTodoAction } from "./actions";
import type { Priority, ITask, TaskStatus } from "@/lib/types";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const todoSchema = z.object({
  title: z
    .string()
    .min(1, "กรุณาระบุหัวข้องาน")
    .max(150, "หัวข้องานต้องไม่เกิน 150 ตัวอักษร"),
  description: z
    .string()
    .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร")
    .optional(),
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
export default function TodoForm({
  open,
  onClose,
  boardId,
  todo,
}: TodoFormProps) {
  const router = useRouter();
  const isEditing = !!todo;
  const [isPending, startTransition] = useTransition();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title ?? "",
      description: todo?.description ?? "",
      status: (todo?.status as TaskStatus) ?? "TODO",
      priority: (todo?.priority as Priority) ?? "MEDIUM",
      dueDate: todo?.dueDate
        ? new Date(todo.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  function onSubmit(values: TodoFormValues) {
    startTransition(async () => {
      const payload = {
        title: values.title,
        description: values.description,
        status: values.status as TaskStatus,
        priority: values.priority as Priority,
        dueDate: values.dueDate ? new Date(values.dueDate) : null,
        boardId,
      };

      if (isEditing && todo?.id) {
        await updateTodoAction({ id: todo.id, ...payload });
      } else {
        await createTodoAction(payload);
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
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>{isEditing ? "แก้ไขงาน" : "สร้างงานใหม่"}</SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "แก้ไขรายละเอียดของงานนี้"
                  : "เพิ่มงานใหม่เข้าใน board"}
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
                    <FormLabel>หัวข้องาน *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น ออกแบบหน้า Dashboard"
                        autoFocus
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
                            <SelectItem value="TODO">📋 To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                              🔄 In Progress
                            </SelectItem>
                            <SelectItem value="DONE">✅ Done</SelectItem>
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

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      กำหนดส่ง
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>รายละเอียด</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="รายละเอียดเพิ่มเติมของงานนี้..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    : "สร้างงาน"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
