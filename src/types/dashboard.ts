import {
  Material,
  Image as PrismaImage,
  ProjectMaterial,
  Project,
  Location,
} from "@prisma/client";
import { ImageLoaderProps } from "next/image";

export type Images = {
  images: Array<PrismaImage>;
};

export interface extendedImageLoaderProps extends ImageLoaderProps {
  height?: number;
}

export type EnrichedProjectMaterials = Array<
  ProjectMaterial & { material: Material }
>;

export type ProjectMaterials = {
  projectMaterial: EnrichedProjectMaterials;
};

export type FilterOptions = {
  searchTerm: string;
};

export type FullyEnrichedProject = Project &
  Images &
  ProjectMaterials & { location: Location };
