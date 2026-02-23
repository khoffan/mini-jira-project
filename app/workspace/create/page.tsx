import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WorkspaceCreateForm from './workspace-create-form'

export default async function CreateWorkspacePage() {
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200/50">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        สร้าง Workspace ใหม่
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-2">
                        สร้าง Workspace เพื่อเริ่มจัดการโปรเจกต์ของคุณ
                    </p>
                </div>

                {/* Form */}
                <WorkspaceCreateForm userId={authUser.id} />
            </div>
        </main>
    )
}
