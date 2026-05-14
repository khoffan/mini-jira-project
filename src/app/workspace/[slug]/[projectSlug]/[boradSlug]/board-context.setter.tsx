"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/store/use-board-store";

interface BoardContextSetterProps {
  board: { id: string; title: string; slug?: string };
}

export default function BoardContextSetter({ board }: BoardContextSetterProps) {
  const setBoard = useBoardStore((state) => state.setBoard);

  useEffect(() => {
    setBoard({ id: board.id, title: board.title });
  }, [board.id, board.title, setBoard]);

  return null;
}
