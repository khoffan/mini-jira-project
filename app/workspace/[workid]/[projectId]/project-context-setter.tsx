'use client'

import { useEffect } from 'react'
import { useProjectStore } from '@/store/use-project-store'

interface ProjectContextSetterProps {
    project: { id: string; title: string }
}

export default function ProjectContextSetter({ project }: ProjectContextSetterProps) {
    const setProject = useProjectStore((s) => s.setProject)

    useEffect(() => {
        setProject(project)
        return () => setProject(null)
    }, [project, setProject])

    return null
}
