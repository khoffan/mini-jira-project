'use server'

import prisma from "@/lib/prisma/prisma_conf"

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
        const res = await prisma.user.update({
            where: {
                uid: userId as string,
            },
            data: {
                name: fullname ?? "",
            },

        })
        console.log(res)
    } catch (error) {
        console.log(error)
    } finally {
    }
}