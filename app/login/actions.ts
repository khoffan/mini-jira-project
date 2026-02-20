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


    const { error } = await supabase.auth.signInWithPassword(data)


    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
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