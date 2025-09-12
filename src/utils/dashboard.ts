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
        projectMaterial: { include: { material: { include: { supplier: true } } } },
        stakeholders: true,
      },
      orderBy: [{
        votes: "desc"
      },
      {
        title: "asc"
      }],
    });
  } catch (err) {
    console.error(err);
    return err as Error;
  }
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const searchProjects = async ({
  searchTerm,
}: FilterOptions): Promise<
  Array<FullyEnrichedProject> | Error> => {

  if (!searchTerm) return new Error("no search criteria provided");
  try {
    const sanitizedSearchTerm = searchTerm.toLowerCase().trim()
    // for now, material categories are stored as capitalized strings 
    const materialCategorySearchTerm = capitalize(sanitizedSearchTerm)
    let filter;
    switch (sanitizedSearchTerm) {
      // special case requested by Marie
      case "pavilion":
        filter = { area: { lte: 50 } }
        break
      case "small":
        filter = { area: { gt: 50, lte: 100 } }
        break
      case "medium":
        filter = { area: { gt: 100, lte: 500 } }
        break
      case "large":
        filter = { area: { gt: 500 } }
        break
      default:
        filter = {
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
            {
              projectMaterial: {
                some: {
                  material: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive"
                    }
                  }
                }
              }
            },
            {
              projectMaterial: {
                some: {
                  material: {
                    tags: { has: materialCategorySearchTerm }
                  }
                }
              }
            },
          ],
        }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await prisma.project.findMany({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      where: filter,
      include: {
        images: true,
        projectMaterial: { include: { material: { include: { supplier: true } } } },
        stakeholders: true,
      },
      orderBy: [{
        votes: "desc"
      },
      {
        title: "asc"
      }],
    });
  } catch (err) {
    console.error(err);
    return err as Error;
  }
};
