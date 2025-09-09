"use server";

import prisma from "@/lib/prisma";


function getMidnightToday(): Date {
    const midnightToday = new Date()
    midnightToday.setHours(0, 0, 0, 0)
    return midnightToday
}

export async function castVote(projectID: string, email: string) {
    const midnightToday = getMidnightToday()
    const res = await prisma.$transaction(
        async (tx) => {
            const { count } = await tx.user.updateMany({
                where: {
                    email,
                    OR: [
                        { lastVote: null },
                        { lastVote: { lt: midnightToday } }
                    ]
                },
                data: { voteCount: { increment: 1 }, lastVote: new Date() }
            })
            console.log(`count=${count}`)
            // if we updated, then update the project counts 
            if (count === 1) {
                const project = await tx.project.update({
                    where: { id: projectID },
                    data: { votes: { increment: 1 } },
                    select: { votes: true }
                })
                const user = await tx.user.findUnique({ where: { email }, select: { voteCount: true } })

                return {
                    projectVotes: project.votes,
                    userVotes: user?.voteCount,
                }
            }
            // now we need to figure out why we couldn't update; is it because we've already voted today or because the user doesn't exist? 
            const user = await tx.user.findUnique({ where: { email } });
            console.log(user)

            if (user === null) {
                // user doesn't exist, let's update the project counts and create the new user 
                const project = await tx.project.update({
                    where: { id: projectID },
                    data: { votes: { increment: 1 } },
                    select: { votes: true }
                })
                const user = await tx.user.create({ data: { voteCount: 1, lastVote: new Date(), email }, select: { voteCount: true } })

                return {
                    projectVotes: project.votes,
                    userVotes: user?.voteCount,
                }
            }
            // user existed but voted too recently, return an error 
            return new Error(`You voted too recently! Please wait until tomorrow to vote again`)
        }
    )

    if (res instanceof Error) {
        throw res
    }
    return res

}