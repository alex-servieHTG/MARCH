import {
  BUILDING_TYPOLOGY,
  Material,
  Image,
  Location,
  CONSTRUCTION_TYPOLOGY,
} from "@prisma/client";
import { FullyEnrichedProject, ProjectMaterials } from "@/types/dashboard";
import * as data from "./testData.json";
import { randomUUID } from "crypto";

const generateMaterial = (): Material => {
  const mat = data[0].materials[0];
  return {
    id: randomUUID(),
    name: mat.materialName,
    description: mat.description,
    url: mat.url,
    supplierId: randomUUID(),
    tags: mat.tags ?? ["title-image"],
    certifications: [],
  };
};

export const generateImage = ({
  projectId = randomUUID(),
}: Partial<Image>): Image => ({
  id: randomUUID(),
  url: "https://fake-url.com",
  projectId,
  aiTags: ["wood", "house", "interior"],
  credit: "Joe Smith",
});

const generateProjectMaterial = (): ProjectMaterials => ({
  projectMaterial: [
    {
      id: randomUUID(),
      materialId: randomUUID(),
      projectId: randomUUID(),
      usedWhere: data[0].materials[0].usedWhere,
      material: generateMaterial(),
      percentage: Math.floor(Math.random()) * 100,
    },
  ],
});

export const generateProject = (): FullyEnrichedProject => {
  const projectData = data[0];
  const locationId = randomUUID();
  return {
    id: randomUUID(),
    createdAt: new Date(),
    title: projectData.title,
    description: projectData.description,
    locationId,
    location: { ...projectData.location, id: locationId } as Location,
    yearCompleted: projectData.yearCompleted,
    typology: BUILDING_TYPOLOGY.COMMERCIAL,
    authorId: randomUUID(),
    selectedForCompetition: false,
    images: [],
    ...generateProjectMaterial(),
    area: projectData.area,
    construction: CONSTRUCTION_TYPOLOGY.NEW,
    votes: 10,
  };
};
