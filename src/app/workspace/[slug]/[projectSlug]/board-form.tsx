"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Columns3 } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  title: z
    .string()
    .min(1, "กรุณาระบุชื่อ board")
    .max(80, "ชื่อ board ต้องไม่เกิน 80 ตัวอักษร"),
  description: z
    .string()
    .max(300, "รายละเอียดต้องไม่เกิน 300 ตัวอักษร")
    .optional(),
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

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: board?.title ?? "",
      description: board?.description ?? "",
      color: board?.color ?? "#6366f1",
    },
  });

  const watchedColor = form.watch("color");

  function onSubmit(values: BoardFormValues) {
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
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Color accent bar */}
        <div
          className="h-1 shrink-0 transition-colors duration-300"
          style={{ backgroundColor: watchedColor }}
        />

        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: watchedColor }}
            >
              <Columns3 className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle>
                {isEditing ? "แก้ไข Board" : "สร้าง Board ใหม่"}
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "แก้ไขข้อมูลของ board"
                  : "เพิ่ม board ใหม่ในโปรเจกต์นี้"}
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
                    <FormLabel>ชื่อ Board *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="เช่น Sprint 1, Backlog, Design Review"
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
                    <FormLabel>รายละเอียด</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="board นี้ใช้สำหรับ..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color picker */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สีประจำ Board</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => field.onChange(c.value)}
                            className={`h-7 w-7 rounded-full border-2 transition-all ${
                              field.value === c.value
                                ? "border-foreground scale-110 shadow-md"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          />
                        ))}
                        {/* Custom color */}
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-7 w-7 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
                          title="สีกำหนดเอง"
                        />
                      </div>
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
                    : "สร้าง Board"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
