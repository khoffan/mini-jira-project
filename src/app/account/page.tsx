import { redirect } from 'next/navigation'
import AccountForm from './account-form'
import { getServerSession } from '@/lib/get-session'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export default async function Account() {
    const session = await getServerSession()

    if (!session) {
        redirect("/login")
    }

    await dbConnect()
    const authUser = await User.findById(session.uid).lean()

    if (!authUser) {
        redirect("/login")
    }

    const serializedUser = {
        ...JSON.parse(JSON.stringify(authUser)),
        createAt: (authUser as any).createdAt ? (authUser as any).createdAt.toISOString() : new Date().toISOString(),
        updateAt: (authUser as any).updatedAt ? (authUser as any).updatedAt.toISOString() : new Date().toISOString()
    }

    return <AccountForm user={serializedUser} />
}