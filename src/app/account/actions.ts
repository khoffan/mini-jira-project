'use server'

import dbConnect from "@/lib/db"
import User from "@/lib/models/User"

export async function updateProfileAction({
    userId,
    fullname,
    username,
    website,
    avatar_url,
}: {
    userId: string
    fullname: string | null
    username: string | null
    website: string | null
    avatar_url: string | null
}) {
    try {
        await dbConnect()
        const res = await User.findByIdAndUpdate(
            userId,
            { name: fullname ?? "" },
            { new: true }
        ).lean()
        console.log(res)
    } catch (error) {
        console.log(error)
    } finally {
    }
}