import { cookies } from 'next/headers'

/**
 * Server-side session helper
 * อ่าน Firebase UID จาก cookie ที่ Client (AuthInitializer) เขียนไว้
 * ใช้ใน Server Components แทน supabase.auth.getUser()
 */
export async function getServerSession(): Promise<{ uid: string } | null> {
    const cookieStore = await cookies()
    const uid = cookieStore.get('firebase-uid')?.value

    if (!uid || uid.trim() === '') return null

    return { uid }
}
