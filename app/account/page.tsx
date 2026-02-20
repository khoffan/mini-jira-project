import { redirect } from 'next/navigation'
import AccountForm from './account-form'
import { createClient } from '@/lib/supabase/server'

export default async function Account() {
    const supabase = await createClient()

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect("/login")
    }

    console.log("user account page", authUser)

    return <AccountForm user={authUser} />
}