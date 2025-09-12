"use server";

import prisma from "@/lib/prisma";
import { Prisma, Vote } from "@prisma/client";


interface VoteSuccess {
    type: "success",
    projectVotes: number,
    userVotes: number,
    vote: Vote
}

interface AlreadyVoted {
    type: "alreadyVoted",
}

interface VoteError {
    type: "error",
    message: string
}


/** Return yyyy-mm-dd string representing the user's local calendar day 
 * now: current datetime
 * tz: client's timezone, of the form "Europe/Berlin"
*/
function voteDayInTZ(now: Date, tz: string) {
    // Format the user's *local* date (yyyy-mm-dd)
    const local = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
        .format(now); // e.g. "2025-09-12"
    return local; // "YYYY-MM-DD"
}


export async function castVote(projectId: string, email: string, timezone: string): Promise<VoteSuccess | AlreadyVoted | VoteError> {
    const voteOnStr = voteDayInTZ(new Date(), timezone)
    const voteOn = new Date(`${voteOnStr}T00:00:00.000Z`)

    const res = await prisma.$transaction(
        async (tx) => {
            let user = await tx.user.findFirst({ where: { email } })
            if (user === null) {
                user = await tx.user.create({ data: { email } })
            }
            try {
                const vote = await tx.vote.create({
                    data: { userId: user.id, projectId, voteOn },
                });
                const project = await tx.project.update({
                    where: { id: projectId },
                    data: { votes: { increment: 1 } },
                });
                const userUpdated = await tx.user.update({
                    where: { id: user.id },
                    data: { voteCount: { increment: 1 } },
                });
                return {
                    type: "success",
                    projectVotes: project.votes,
                    userVotes: userUpdated.voteCount,
                    vote
                } as VoteSuccess
            } catch (err) {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
                    return {
                        type: "alreadyVoted",
                    } as AlreadyVoted
                }
                throw err
            }

        }
    )
    if (res instanceof Error) {
        return {
            type: "error",
            message: res.message
        }
    }

    return res

}