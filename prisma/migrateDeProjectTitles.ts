import prisma from "../src/lib/prisma";


const projectChanges = [
    {
        title: "Heinrich Eschenburg Schule", newDescription: "The supporting structure of the school extension consists of prefabricated cross-laminated timber panels and wooden trusses, while the façade is made of bricks. The building is heated by an air source heat pump and ventilated naturally, aided by the chimney effect and the control of the window elements."
    },
    {
        title: "Kita Bachlinge", newDescription: "The roof structure of the kindergarten consists of prefabricated cross-laminated timber panels with a supporting structure made of wood and wooden studs. The building is heated with an air source heat pump and underfloor heating, uses the chimney effect for natural ventilation, and has a photovoltaic system."
    },
    {
        title: "Kita Münsterdorf", newDescription: "The Paper Garden is an ecology garden and educational building in London built by volunteers using 60% retained, reclaimed + natural materials. The space is used for growing, making, cooking, story-telling and stillness so people can come together and contribute to ecological and social change."
    },
]


async function main() {
    const titles = projectChanges.map(update => update.title)
    const projects = await prisma.project.findMany({ where: { title: { in: titles } } })
    for (const project of projects) {
        const newDescription = projectChanges.find(c => c.title === project.title)?.newDescription
        const res = await prisma.project.update({
            where: { id: project.id },
            data: {
                description: newDescription
            }
        })
        console.log(res)
    }
}


main()