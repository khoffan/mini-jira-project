import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth Middleware Helper (Firebase-compatible)
 * ตรวจสอบ firebase-uid cookie แทน Supabase session
 * Logic เหมือนเดิม — redirect based on auth state
 */
export async function updateSession(request: NextRequest) {
    const uid = request.cookies.get('firebase-uid')?.value
    const isLoggedIn = Boolean(uid && uid.trim() !== '')
    const { pathname } = request.nextUrl

    // ข้ามการเช็คสำหรับ Server Actions
    if (request.headers.has('next-action')) {
        return NextResponse.next()
    }

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
    const isProtectedPage = pathname.startsWith('/workspace') || pathname.startsWith('/board') || pathname.startsWith('/account')
    const isRootPage = pathname === '/'

    // 1. ล็อกอินแล้ว: ไม่ควรอยู่ที่หน้า Login, Signup หรือหน้า Landing Page (Root)
    if (isLoggedIn && (isAuthPage || isRootPage)) {
        return NextResponse.redirect(new URL('/workspace', request.url))
    }

    // 2. ยังไม่ได้ล็อกอิน: ไม่ควรเข้าหน้า Protected
    if (!isLoggedIn && isProtectedPage) {
        // เก็บ URL เดิมไว้ใน callbackUrl เพื่อให้พอล็อกอินเสร็จแล้วกลับมาหน้าที่เดิมได้ (Optional)
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}
