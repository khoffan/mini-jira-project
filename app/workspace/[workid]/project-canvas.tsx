'use client'

import React, { useCallback, useMemo } from 'react'
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    type Edge,
    type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import BoardNode from '@/components/dashboard/BoardNode'
import type { Project } from './project-list'

const nodeTypes = {
    boardNode: BoardNode,
}

const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-emerald-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
]

interface ProjectCanvasProps {
    projects: Project[]
    workspaceId: string
}

export default function ProjectCanvas({ projects, workspaceId }: ProjectCanvasProps) {
    const initialNodes = useMemo(() =>
        projects.map((project, i) => ({
            id: project.id,
            type: 'boardNode' as const,
            position: {
                x: (i % 3) * 300 + 50,
                y: Math.floor(i / 3) * 200 + 50,
            },
            data: {
                label: project.title,
                gradient: gradients[i % gradients.length],
                taskCount: project._count?.boards || 0,
                description: project.description,
                linkTo: `/workspace/${workspaceId}/${project.id}`,
            },
        })),
        [projects, workspaceId]
    )

    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    )

    return (
        <div className="w-full h-150 sm:h-175 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#cbd5e1" gap={20} />
                <Controls />
                <MiniMap zoomable pannable />
            </ReactFlow>
        </div>
    )
}