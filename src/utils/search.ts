"use client"

import { FullyEnrichedProject } from "@/types/dashboard";

type Predicate = (project: FullyEnrichedProject) => boolean;

const finalistMap = {
    pavilion: [
        "Growing matter(s)",
        "den talamh'",
        "No Time to Waste",
        "Bienenskulptur",
        "UDO",
        "Kiosk zur FÜRstin",
        "Building Beyond Bricks",
        "SWEAT. Sauna",
    ],
    small: [
        "Forest Gate House",
        "Re:House",
        "MOORKENS",
        "Bademaschinen",
        "The Dialogue Express Cafe",
        "The Makers Barn",
        "office  Van Laethem - Architecten",
        "Inhabiting the stable",
    ],
    medium: [
        "Feldballe School",
        "Buiten Huis Zeist",
        "Felsenburg",
        "MARSHMALLOW",
        "Artist in Residence Rotterdam",
        "Hembrug A11",
        "jtB",
        "Hempcrete House",
        "Nest House",
        "SPIEGEL",
        "Forest Meadow House",
        "Nature Retreat Westbroek",
        "Rosa María house",
        "Haus am Ziestsee",
        "Passive House in Serra d'Ordal",
        "Omloop",
        "Blue House Azores",
        "The Paper Garden",
        "The Gallery House",
        "House without any cement",
        "Zurich Bus Station",
    ],
    large: [
        "Knoest",
        "The Salvation Army Grote Kreek",
        "Heinrich Eschenburg Schule",
        "Kita Bachlinge",
        "Kita Münsterdorf",
        "Sara Cultural Center",
        "Lumi",
        "Baobab",
        "Magasin X",
        "Holzhaus LINSE",
        "Cederhusen",
        "\"Roots\" - the tallest timber high-rise in Germany",
        "Multidisciplinary Health Center and Pharmacy",
        "Primary school De Verwondering",
        "Augstine's Garden",
        "Château de Beaucastel",
        "DUCHESSE",
        "30+8 Social Housing units in Palma de Mallorca",
        "Barretts Grove",
        "After-School Care Centre Waldorf School am Prenzlauer Berg",
    ]
}




export default function searchProjects(projects: Array<FullyEnrichedProject>, searchTerm: string): Array<FullyEnrichedProject> {

    const sanitizedSearchTerm = searchTerm.toLowerCase().trim()
    let predicate: Predicate

    switch (sanitizedSearchTerm) {
        case "pavilion":
            // predicate = (project: FullyEnrichedProject): boolean => project.area <= 50
            predicate = (project: FullyEnrichedProject): boolean => finalistMap.pavilion.includes(project.title)
            break
        case "small":
            // predicate = (project: FullyEnrichedProject): boolean => project.area > 50 && project.area <= 100
            predicate = (project: FullyEnrichedProject): boolean => finalistMap.small.includes(project.title)
            break
        case "medium":
            // predicate = (project: FullyEnrichedProject): boolean => project.area > 100 && project.area <= 500
            predicate = (project: FullyEnrichedProject): boolean => finalistMap.medium.includes(project.title)
            break
        case "large":
            // predicate = (project: FullyEnrichedProject): boolean => project.area > 500
            predicate = (project: FullyEnrichedProject): boolean => finalistMap.large.includes(project.title)
            break
        default:
            predicate = (project: FullyEnrichedProject): boolean => {
                const titleBool = project.title.toLowerCase().includes(sanitizedSearchTerm)
                const companyNameBool = project.stakeholders.some(s => s.companyName.toLowerCase().includes(sanitizedSearchTerm))
                const materialBool = project.projectMaterial.some(pm => pm.material.name.toLowerCase().includes(sanitizedSearchTerm) || pm.material.tags.some(t => t.toLowerCase().includes(sanitizedSearchTerm)))
                const locationBool = project.location === null ? false : project.location.toLowerCase().includes(sanitizedSearchTerm)
                return (
                    titleBool || companyNameBool || materialBool || locationBool
                )
            }
    }

    const filtered = projects.filter(predicate)
    return filtered
}