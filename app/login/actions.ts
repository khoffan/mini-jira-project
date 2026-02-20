'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma/prisma_conf'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }


    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) return {
        error: error.message
    }

    return {
        success: true,
        data: {
            uid: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata.full_name || '',
            image: authData.user.user_metadata.avatar_url || ''
        }
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const preData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data, error } = await supabase.auth.signUp(preData)

    if (error) {
        redirect('/error')
    }

    if (data.user) {
        await prisma.user.create({
            data: {
                uid: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata.name,
                image: data.user.user_metadata.avatar_url,
            },
        })
    }

    revalidatePath('/', 'layout')
    redirect('/account')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}