'use client'

import { useEffect } from "react";
import { useBoardStore } from "@/store/use-board-store";

interface BoardContextSetterProps {
    boardId: string;
    boardTitle: string;
}

export default function BoardContextSetter({ boardId, boardTitle }: BoardContextSetterProps) {
    const setBoard = useBoardStore((state) => state.setBoard);

    useEffect(() => {
        setBoard({ id: boardId, title: boardTitle });
    }, [boardId, boardTitle, setBoard]);

    return null;
}   