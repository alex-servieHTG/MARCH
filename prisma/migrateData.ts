"use server";

import { readFileSync } from "fs";
import prisma from "../src/lib/prisma";
import type { ProjectSubmissionForm } from "../src/types/forms";
import { projectSubmissionSchema } from "../src/lib/validation/projectSchema";
import { Prisma } from "@prisma/client";

const jotformData: ProjectSubmissionForm[] = JSON.parse(
  readFileSync("src/tests/jotformData.json", "utf-8")
);

type ProjectWithImageFolder = ProjectSubmissionForm & {
  imageDirectory?: string;
};

async function isDuplicate(project: ProjectSubmissionForm): Promise<boolean> {
  if (!project.title || !project.email) return false;

  const existing = await prisma.project.findFirst({
    where: {
      title: project.title,
      author: {
        email: project.email,
      },
    },
    include: { author: true },
  });

  return Boolean(existing);
}

async function createProject(projectData: ProjectWithImageFolder) {
  try {
    const validatedData = projectSubmissionSchema.safeParse(projectData);

    if (!validatedData.success) {
      console.warn("Skipping invalid project:", validatedData.error.format());
      return null;
    }

    const data = validatedData.data;

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        yearCompleted: data.yearCompleted,
        typology: data.typology,
        construction: data.construction,
        area: data.area,
        // imageCredit: data.imageCredit ?? "", this isn't a field in the schema but I think we may want to add it
        location: {
          create: {
            street: data.location.street ?? Prisma.skip,
            city: data.location.city,
            country: data.location.country,
            postcode: data.location.postcode ?? Prisma.skip,
          },
        },
        author: {
          connectOrCreate: {
            where: { email: data.email },
            create: { email: data.email },
          },
        },
        stakeholders: data.stakeholders.length > 0 && {
          create: data.stakeholders.map((s) => ({
            type: s.type,
            companyName: s.companyName,
            email: s.email,
            phoneNumber: s.phoneNumber,
            location: {
              create: {
                street: s.location.street ?? Prisma.skip,
                city: s.location.city,
                country: s.location.country,
                postcode: s.location.postcode ?? Prisma.skip,
              },
            },
          })),
        },
      },
    });

    await createMaterialsAndConnections(data.materials, project.id);

    console.log(`Project created: ${project.title}`);
    return project;
  } catch (err) {
    console.error("Failed to create project:", projectData.title, err);
    return null;
  }
}

async function createMaterialsAndConnections(
  materials: ProjectSubmissionForm["materials"],
  projectId: string
) {
  return Promise.allSettled(
    materials.map(async (m) => {
      try {
        return prisma.material.create({
          data: {
            name: m.materialName,
            description: m.description,
            url: m.url ?? Prisma.skip,
            tags: m.tags,
            supplier: {
              create: {
                name: m.supplierName,
                website: m.supplierContact.url,
                email: m.supplierContact.email,
                phoneNumber: m.supplierContact.phoneNumber,
                locations: {
                  create: m.supplierContact.locations ?? Prisma.skip,
                },
              },
            },
            projectMaterials: {
              create: {
                usedWhere: m.usedWhere,
                projectId,
                percentage: m.percentage ?? Prisma.skip,
              },
            },
          },
        });
      } catch (err) {
        console.error(`Error creating material "${m.materialName}"`, err);
      }
    })
  );
}

export async function main(): Promise<void> {
  console.log("Starting migration for", jotformData.length, "projects...\n");

  let created = 0;

  for (const raw of jotformData) {
    const isAlreadyInserted = await isDuplicate(raw);
    if (isAlreadyInserted) {
      console.log(`Skipping duplicate: ${raw.title} (${raw.email})`);
      continue;
    }

    const result = await createProject(raw);
    if (result) created++;
  }

  console.log(`\n Migration complete. Total projects created: ${created}`);
}

(async () => {
  try {
    await main();
    await prisma.$disconnect();
  } catch (err) {
    console.error("Error during migration:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
