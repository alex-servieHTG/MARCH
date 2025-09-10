"use client"

import { FullyEnrichedProject } from "@/types/dashboard";

type Predicate = (project: FullyEnrichedProject) => boolean;


export default function searchProjects(projects: Array<FullyEnrichedProject>, searchTerm: string): Array<FullyEnrichedProject> {

    const sanitizedSearchTerm = searchTerm.toLowerCase().trim()
    let predicate: Predicate

    switch (sanitizedSearchTerm) {
        case "pavilion":
            predicate = (project: FullyEnrichedProject): boolean => project.area <= 50
            break
        case "small":
            predicate = (project: FullyEnrichedProject): boolean => project.area > 50 && project.area <= 100
            break
        case "medium":
            predicate = (project: FullyEnrichedProject): boolean => project.area > 100 && project.area <= 500
            break
        case "large":
            predicate = (project: FullyEnrichedProject): boolean => project.area > 500
            break
        default:
            predicate = (project: FullyEnrichedProject): boolean => {
                return (
                    project.title.toLowerCase().includes(sanitizedSearchTerm) ||
                    project.stakeholders.some(s => s.companyName.toLowerCase().includes(sanitizedSearchTerm)) ||
                    project.projectMaterial.some(pm => pm.material.name.toLowerCase().includes(sanitizedSearchTerm) || pm.material.tags.some(t => t.toLowerCase().includes(sanitizedSearchTerm)))
                )
            }
    }
    return projects.filter(predicate)
}