"use server";

import { readFileSync } from "fs";
// import type { Project } from "@prisma/client";
import prisma from "../src/lib/prisma";
import type { ProjectSubmissionForm } from "../src/types/forms";
import { projectSubmissionSchema } from "../src/lib/validation/projectSchema";

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
    const validatedData = projectSubmissionSchema.parse(projectData);

    const newProject = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: {
          create: { ...validatedData.location },
        },
        yearCompleted: validatedData.yearCompleted,
        typology: validatedData.typology,
        author: {
          connectOrCreate: {
            where: { email: validatedData.email },
            create: { email: validatedData.email },
          },
        },
        area: validatedData.area,
        construction: validatedData.construction,
        votes: 0,
        stakeholders: {
          create: validatedData.stakeholders.map((s) => ({
            type: s.type,
            companyName: s.companyName,
            email: s.email,
            location: { create: { ...s.location } },
            phoneNumber: s.phoneNumber,
          })),
        },
      },
    });

    const materials = await createMaterialsAndConnections(
      validatedData.materials,
      newProject.id
    );

    console.log(`Project created: ${newProject.title} (${newProject.id})`);
    return newProject;
  } catch (err) {
    console.error("Failed to create project:", projectData.title, err);
    return null;
  }
}

async function createMaterialsAndConnections(
  materialData: ProjectSubmissionForm["materials"],
  projectId: string
) {
  return Promise.all(
    materialData.map((m) => {
      try {
        return prisma.material.create({
          data: {
            name: m.materialName,
            description: m.description,
            url: m.url,
            tags: m.tags,
            certifications: [],
            supplier: {
              create: {
                name: m.supplierName,
                website: m.supplierContact.url,
                email: m.supplierContact.email ?? [],
                phoneNumber: m.supplierContact.phoneNumber,
                locations: {
                  create: [...m.supplierContact.locations],
                },
              },
            },
            projectMaterials: {
              create: {
                usedWhere: m.usedWhere,
                projectId,
                percentage: 40,
              },
            },
          },
        });
      } catch (err) {
        console.error("Error creating material:", err);
      }
    })
  );
}

export async function main(): Promise<void> {
  console.log("Starting JotForm migration with", jotformData.length, "entries...");

  for (const project of jotformData) {
    let validatedData: ProjectSubmissionForm;
    try {
        validatedData = projectSubmissionSchema.parse(project);
    } catch (err) {
        console.error("Invalid project submission:", err);
        continue;
  }

  const isAlreadyInserted = await isDuplicate(validatedData);
  if (isAlreadyInserted) {
    console.log(`Skipping duplicate: ${validatedData.title} (${validatedData.email})`);
    continue;
  }

    await createProject(project);
  }

  console.log("JotForm migration complete.");
}

(async () => {
  try {
    await main();
    await prisma.$disconnect();
  } catch (err) {
    console.error("Fatal error during migration:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
