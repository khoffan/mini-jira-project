'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export default function AuthInitializer() {
    const supabase = createClient()
    const setUser = useAuthStore((state) => state.setUser)
    const clearAuth = useAuthStore((state) => state.clearAuth)

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                // ดึงข้อมูล User (สามารถทำ API ดึงจาก Prisma เพิ่มเติมตรงนี้ได้)
                setUser({
                    uid: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || '',
                    image: session.user.user_metadata.avatar_url || '',
                })
            } else {
                clearAuth()
            }
        }

        getUser()

        // Listen การเปลี่ยนแปลงสถานะ (เช่น Login/Logout ใน Tab อื่น)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser({
                    uid: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || '',
                    image: session.user.user_metadata.avatar_url || '',
                })
            } else {
                clearAuth()
            }
        })

        return () => subscription.unsubscribe()



    }, [supabase, setUser, clearAuth])

    return null
}