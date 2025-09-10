import {
  BUILDING_TYPOLOGY,
  Image,
  CONSTRUCTION_TYPOLOGY,
  Stakeholder,
  STAKEHOLDER_TYPE,
} from "@prisma/client";
import { EnrichedMaterial, FullyEnrichedProject, ProjectMaterials } from "@/types/dashboard";
import * as data from "./testData.json";
import { randomUUID } from "crypto";

const generateMaterial = (): EnrichedMaterial => {
  const mat = data[0].materials[0];
  const supplierId = randomUUID();
  return {
    id: randomUUID(),
    name: mat.materialName,
    description: mat.description,
    url: mat.url,
    supplierId,
    tags: mat.tags ?? ["title-image"],
    supplier: {
      email: [],
      name: "supplier",
      id: supplierId,
      phoneNumber: [],
      website: null,
      locations: []
    },
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

const generateStakeholder = (): Stakeholder => ({
  id: randomUUID(),
  type: [STAKEHOLDER_TYPE.ARCHITECT],
  companyName: data[0].stakeholders[0].companyName,
  email: data[0].stakeholders[0].email,
  phoneNumber: data[0].stakeholders[0].phoneNumber,
  location: "Berlin, Germany",
  url: "www.architect.com",
});

export const generateProject = (): FullyEnrichedProject => {
  const projectData = data[0];
  return {
    id: randomUUID(),
    createdAt: new Date(),
    title: projectData.title,
    description: projectData.description,
    location: "123 Main Street",
    yearCompleted: projectData.yearCompleted,
    typology: [BUILDING_TYPOLOGY.COMMERCIAL],
    authorId: randomUUID(),
    selectedForCompetition: false,
    images: [],
    ...generateProjectMaterial(),
    area: projectData.area,
    construction: [CONSTRUCTION_TYPOLOGY.NEW],
    votes: 10,
    stakeholders: [generateStakeholder()],
    photographerUrl: "www.photos.com",
    imageCredit: "Joe Smith",
  };
};
