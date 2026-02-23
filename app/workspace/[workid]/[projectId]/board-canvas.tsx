'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Panel,
    type Node,
    type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import BoardNode from '@/components/dashboard/BoardNode'
import { updateBoardPositionAction } from './actions'
import BoardForm from './board-form'
import type { Board } from './board-list'

const nodeTypes = {
    boardNode: BoardNode,
}

const gradients = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
]

interface BoardEdgeData {
    id: string
    sourceBoardId: string
    targetBoardId: string
}

interface BoardCanvasProps {
    boards: Board[]
    edges: BoardEdgeData[]
    workspaceId: string
    projectId: string
}

export default function BoardCanvas({ boards, edges: boardEdges, workspaceId, projectId }: BoardCanvasProps) {
    const [showForm, setShowForm] = useState(false)

    const initialNodes: Node[] = useMemo(() =>
        boards.map((board, i) => ({
            id: board.id,
            type: 'boardNode',
            position: { x: board.positionX, y: board.positionY },
            data: {
                label: board.title,
                gradient: gradients[i % gradients.length],
                taskCount: board._count?.tasks || 0,
                boardId: board.id,
                workspaceId,
                projectId,
            },
        })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [boards]
    )

    const initialEdges = useMemo(() =>
        boardEdges.map((e) => ({
            id: e.id,
            source: e.sourceBoardId,
            target: e.targetBoardId,
            animated: true,
        })),
        [boardEdges]
    )

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edgesState, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    )

    const onNodeDragStop: NodeMouseHandler = useCallback(
        async (_event: React.MouseEvent, node: Node) => {
            try {
                await updateBoardPositionAction({
                    boardId: node.id,
                    positionX: node.position.x,
                    positionY: node.position.y,
                    workspaceId,
                    projectId,
                })
            } catch (error) {
                console.error('Failed to save board position:', error)
            }
        },
        [workspaceId, projectId]
    )

    return (
        <div className="w-full h-150 sm:h-175 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner relative">
            <ReactFlow
                nodes={nodes}
                edges={edgesState}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#cbd5e1" gap={20} />
                <Controls />
                <MiniMap zoomable pannable />

                <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border border-slate-200 flex gap-2">
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                        + สร้างบอร์ดใหม่
                    </button>
                </Panel>
            </ReactFlow>

            {showForm && (
                <BoardForm
                    workspaceId={workspaceId}
                    projectId={projectId}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    )
}
