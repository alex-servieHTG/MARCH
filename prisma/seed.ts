"use server";
import type {
  materialSubmission,
  ProjectSubmissionForm,
} from "../src/types/forms";
import { projectSubmissionSchema } from "../src/lib/validation/projectSchema";
import { readFileSync } from "fs";
const testData = JSON.parse(readFileSync("src/tests/testData.json", "utf-8"));
const imageData = JSON.parse(
  readFileSync("src/tests/testImages.json", "utf-8")
);
const testUsers = JSON.parse(readFileSync("src/tests/testUsers.json", "utf-8"));
import type { Project } from "@prisma/client";
import prisma from "../src/lib/prisma";
// import {
//   IMAGE_KIT_PUBLIC_KEY,
//   IMAGE_KIT_UPLOAD_URL,
// } from "../src/constants.js";
// import ImageKit from "imagekit";

// const imagekit = new ImageKit({
//   publicKey: IMAGE_KIT_PUBLIC_KEY,
//   privateKey: process.env.IMAGEKIT_API_TOKEN || "",
//   urlEndpoint: IMAGE_KIT_UPLOAD_URL,
// });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UploadResult {
  fileId: string;
  url: string;
  AITags?: Array<{ name: string; confidence: number }>;
}

type ProjectWithImageFolder = Project & {
  imageDirectory: string;
};

type ImageData = {
  id: string;
  url: string;
  aiTags?: string[];
  credit: string;
};

type UserData = {
  id: string;
  email: string;
  voteCount: number;
};

// Temporary extended Prisma client type until regeneration
type ExtendedPrismaClient = typeof prisma & {
  user: {
    findMany: () => Promise<UserData[]>;
    create: (args: {
      data: { email: string; voteCount: number };
    }) => Promise<UserData>;
  };
};

const isAlreadySeeded = async (): Promise<boolean | Error> => {
  const projectTitles = [testData[0].title, testData[1].title];
  try {
    const projects = await prisma.project.findMany({
      where: { OR: [{ title: projectTitles[0] }, { title: projectTitles[1] }] },
    });
    const users = await prisma.user.findMany();
    console.log(
      "DB already seeded? Projects:",
      projects.length === 2,
      "Users:",
      users.length === testUsers.length
    );
    return projects.length === 2 && users.length === testUsers.length;
  } catch (err) {
    console.log("error checking if seeded", err);
    return new Error("cannot check if db is already seeded");
  }
};

async function seedUsers() {
  try {
    console.log("Creating users...");
    const users = await Promise.all(
      testUsers.map((userData: { email: string; voteCount: number }) =>
        (prisma as ExtendedPrismaClient).user.create({
          data: {
            email: userData.email,
            voteCount: userData.voteCount,
          },
        })
      )
    );
    console.log("Users created:", users.length);
    return users;
  } catch (err) {
    console.error("Error creating users:", err);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const uploadImages = async (images: Array<string>, rootDir: string) => {
//   return Promise.all(
//     images.map((i, index) => {
//       const file = readFileSync(`${rootDir}/${i}`).toString("base64");
//       try {
//         return imagekit.upload({
//           file,
//           fileName: `march-mvp-${index}`,
//           responseFields: "metadata, embeddedMetadata, customMetadata, tags",
//           useUniqueFileName: true,
//           extensions: [
//             { name: "google-auto-tagging", maxTags: 5, minConfidence: 40 },
//           ],
//         });
//       } catch (err) {
//         console.error("failed to upload images", err);
//         return err;
//       }
//     })
//   );
// };

async function createMaterialsAndConnections(
  materialData: Array<materialSubmission>,
  projectId: string
) {
  return Promise.all(
    materialData.map((m) => {
      try {
        // const supplierBaseUrl = new URL(m.url).hostname;
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
                projectId: projectId,
                percentage: 40,
              },
            },
          },
        });
      } catch (err) {
        console.log("error creating material", err);
      }
    })
  );
}

const createFullyEnrichedProject = async (
  projectData: ProjectWithImageFolder
) => {
  try {
    const validatedData: ProjectSubmissionForm =
      projectSubmissionSchema.parse(projectData);
    const images = imageData
      .filter((img: ImageData) => img.credit === validatedData.imageCredit)
      .map((img: ImageData) => {
        return {
          id: img.id,
          url: img.url,
          aiTags: img.aiTags,
          credit: img.credit,
        };
      });
    // CREATE PROJECT
    const newProject = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: {
          create: {
            ...validatedData.location,
          },
        },
        yearCompleted: validatedData.yearCompleted,
        typology: validatedData.typology,
        author: { create: { email: validatedData.email } },
        area: validatedData.area,
        construction: validatedData.construction,
        votes: 0,
        stakeholders: {
          create: validatedData.stakeholders.map((stakeholder) => ({
            type: stakeholder.type,
            companyName: stakeholder.companyName,
            email: stakeholder.email,
            location: {
              create: {
                ...stakeholder.location,
              },
            },
            phoneNumber: stakeholder.phoneNumber,
          })),
        },
        images: {
          create: images,
        },
      },
    });
    console.log("NEW PROJECT CREATED: ", newProject);

    // CREATE MATERIALS, SUPPLIERS, PROJECT_MATERIALS, CONNECTIONS
    const newMaterials = await createMaterialsAndConnections(
      validatedData.materials,
      newProject.id
    );
    console.log("NEW MATERIALS CREATED: ", newMaterials);

    const finalProject = await prisma.project.findFirst({
      where: {
        id: newProject.id,
      },
      include: { images: true, materials: true },
    });
    return finalProject;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export async function main(): Promise<void> {
  console.info("SEEDING", testData.length);
  let allProjects: Array<Project>;
  try {
    if (await isAlreadySeeded()) return;
    else {
      allProjects = await Promise.all(
        testData.map((p: ProjectWithImageFolder) => {
          return createFullyEnrichedProject(p);
        })
      );
    }
    console.log("all projects successfully created:", allProjects);
  } catch (err) {
    console.error("could not create all projects", err);
  }
}

(async () => {
  try {
    await main();
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
