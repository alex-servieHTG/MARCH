"use server";

import prisma from "@/lib/prisma";
import { FilterOptions, FullyEnrichedProject } from "@/types/dashboard";

export const getAllProjects = async (): Promise<
  Array<FullyEnrichedProject> | Error
> => {
  try {
    return prisma.project.findMany({
      include: {
        images: true,
        projectMaterial: { include: { material: true } },
        location: true,
      },
    });
  } catch (err) {
    console.error(err);
    return err as Error;
  }
};

export const searchProjects = async ({
  searchTerm,
}: FilterOptions): Promise<Array<FullyEnrichedProject> | Error> => {
  if (!searchTerm) return new Error("no search criteria provided");
  try {
    return await prisma.project.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            stakeholders: {
              some: {
                companyName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      include: {
        images: true,
        projectMaterial: { include: { material: true } },
        stakeholders: true,
        location: true,
      },
    });
  } catch (err) {
    console.error(err);
    return err as Error;
  }
};
