"use server";

import { readFileSync } from "fs";
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
    const validatedData = projectSubmissionSchema.safeParse(projectData);

    if (!validatedData.success) {
      console.warn("Skipping invalid project:", validatedData.error.format());
      return null;
    }

    const data = validatedData.data;

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description ?? "",
        yearCompleted: data.yearCompleted ?? 2025,
        typology: data.typology ?? "INSTITUTIONAL",
        construction: data.construction ?? "NEW",
        area: data.area ?? 0,
        // imageCredit: data.imageCredit ?? "", this isn't a field in the schema but I think we may want to add it
        location: data.location
          ? {
              create: {
                street: data.location.street ?? "",
                city: data.location.city ?? "",
                country: data.location.country ?? "",
                postcode: data.location.postcode ?? "",
              },
            }
          : undefined,
        author: data.email
          ? {
              connectOrCreate: {
                where: { email: data.email },
                create: { email: data.email },
              },
            }
          : undefined,
        stakeholders: Array.isArray(data.stakeholders) && data.stakeholders.length > 0
          ? {
              create: data.stakeholders
                .filter((s) => !!s.companyName)
                .map((s) => ({
                  type: s.type ?? "ARCHITECT",
                  companyName: s.companyName,
                  email: s.email?.filter(Boolean) ?? [],
                  phoneNumber: s.phoneNumber ?? [],
                  location: s.location
                    ? {
                        create: {
                          street: s.location.street ?? "",
                          city: s.location.city ?? "",
                          country: s.location.country ?? "",
                          postcode: s.location.postcode ?? "",
                        },
                      }
                    : undefined,
                })),
            }
          : undefined,
      },
    });

    if (Array.isArray(data.materials) && data.materials.length > 0) {
      await createMaterialsAndConnections(data.materials, project.id);
    }

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
  return Promise.all(
    materials
      .filter((m) => m.materialName && m.supplierName)
      .map(async (m) => {
        try {
          return prisma.material.create({
            data: {
              name: m.materialName,
              description: m.description ?? "",
              url: m.url ?? "",
              tags: m.tags ?? [],
              certifications: [],
              supplier: {
                create: {
                  name: m.supplierName,
                  website: m.supplierContact.url ?? "",
                  email: m.supplierContact.email ?? [],
                  phoneNumber: m.supplierContact.phoneNumber ?? [],
                  locations: {
                    create: m.supplierContact.locations ?? [],
                  },
                },
              },
              projectMaterials: {
                create: {
                  usedWhere: m.usedWhere ?? "",
                  projectId,
                  percentage: 40,
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
