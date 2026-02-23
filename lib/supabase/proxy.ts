import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    );

    // 1. Refresh token และดึงข้อมูล User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. กำหนด Path ที่ต้องการควบคุม
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')
    const isDashboardPage = request.nextUrl.pathname.startsWith('/workspace') ||
        request.nextUrl.pathname.startsWith('/board')

    // ถ้ามี user แล้ว navigate to /dashboard ทันที
    if (user && !isDashboardPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/workspace'
        return NextResponse.redirect(url);
    }

    // 🛡️ ถ้าไม่มี User และพยายามเข้าหน้าส่วนตัว -> ส่งไปหน้า Login
    if (!user && isDashboardPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/login'
        return NextResponse.redirect(url);
    }

    // 🛡️ ถ้า Login แล้ว แต่จะเข้าหน้า Login/Signup -> ส่งไป Dashboard
    if (user && isAuthPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/workspace'
        return NextResponse.redirect(url);
    }


    return supabaseResponse;
}