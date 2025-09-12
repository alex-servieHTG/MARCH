import {
  Material,
  Image as PrismaImage,
  ProjectMaterial,
  Project,
  Stakeholder,
  Supplier,
} from "@prisma/client";
import { ImageLoaderProps } from "next/image";

export type Images = {
  images: Array<PrismaImage>;
};

export interface extendedImageLoaderProps extends ImageLoaderProps {
  height?: number;
}

export type EnrichedMaterial = Material & { supplier: Supplier };

export type EnrichedProjectMaterials = Array<
  ProjectMaterial & { material: EnrichedMaterial }
>;

export type ProjectMaterials = {
  projectMaterial: EnrichedProjectMaterials;
};

export type FilterOptions = {
  searchTerm: string;
};

export type Stakeholders = {
  stakeholders: Array<Stakeholder>;
};

export type FullyEnrichedProject = Project &
  Images &
  ProjectMaterials &
  Stakeholders;
