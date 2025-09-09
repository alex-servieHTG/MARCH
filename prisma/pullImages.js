import { IMAGE_KIT_PUBLIC_KEY, IMAGE_KIT_BASE_URL } from "../src/constants.js";
import ImageKit from "imagekit";
import "dotenv/config";
import prisma from "../src/lib/prisma.ts";

const imagekit = new ImageKit({
  publicKey: IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_API_TOKEN,
  urlEndpoint: IMAGE_KIT_BASE_URL,
});

const normalize = (str) =>
  str
    .replace(/["'_\-]/g, "")
    .toLowerCase()
    .trim();

async function createConnectedImage({ projectTitle, email, url, tags }) {
  console.info(`creating image for ${projectTitle} by ${email}`);
  if (!projectTitle || !email || !url) {
    console.error("Missing required fields");
    throw new Error("Missing required fields", {
      projectTitle,
      email,
      url,
      status: "rejected",
    });
  }
  try {
    // first check image is not already uploaded
    const existingImage = await prisma.image.findFirst({
      where: { url },
    });
    if (existingImage) {
      console.log(`Image already uploaded: ${url}`);
      return;
    }

    // Find the user first (since Project is linked to User by authorId)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.warn(`No user found with email: ${email}`);
      throw new Error("No user found", { email, status: "rejected" });
    }

    // Find the corresponding project by title & authorId
    // const project = await prisma.project.findFirst({
    //   where: {
    //     title: {
    //       contains: projectTitle,
    //       mode: "insensitive",
    //     },
    //     authorId: user.id,
    //   },
    // });
    const normalizedTitle = normalize(projectTitle);
    console.log("NORMALIZED TITLE:", normalizedTitle);
    const projects = await prisma.$queryRaw`
      SELECT *
      FROM "Project"
      WHERE "authorId" = ${user.id}
      AND LOWER(REGEXP_REPLACE("title", '["''_\\-\\s]', '', 'g')) = ${normalizedTitle}
      LIMIT 1;
    `;

    if (projects.length == 0) {
      console.warn(
        `No project id found with title: ${projectTitle} for user: ${email} with id ${user.id}`
      );
      throw new Error("No project found", {
        projectTitle,
        email,
        status: "rejected",
      });
    }
    const project = projects[0]

    // Create the image and connect it to the project
    const image = await prisma.image.create({
      data: {
        url,
        project: {
          connect: { id: project.id },
        },
        aiTags: tags,
        credit: project.imageCredit ?? null,
      },
    });
    return image;
  } catch (error) {
    console.error("Error creating connected image:", error);
    return error;
  }
}

const extractProjectInfo = async (competitionImages) => {
  return competitionImages.map((file) => {
    const parts = file.name.split(".-.");
    // Expected: ["march-competition", "My_Project", "user--at--mail.com", "John"]
    const projectTitleRaw = parts[1] || "";
    const emailRaw = parts[2] || "";

    const projectTitle = decodeURI(projectTitleRaw);
    let email = emailRaw.replace(/--at--/g, "@");
    // first few image uploads did not replace @ with --at--
    if (!email.includes("@")) email = email.replace("_", "@");

    return {
      projectTitle: normalize(projectTitle),
      email,
      url: file.url,
      tags: [
        ...(file.tags ?? []),
        ...(file.AITags ? file.AITags.map((t) => t.name) : []),
      ],
    };
  });
};

async function fetchFileMetadata(skip, limit) {
  try {
    const files = await imagekit.listFiles({
      limit,
      skip,
    });

    console.info(`Fetched ${files.length} files from ImageKit`);
    console.log("file:", files[0]);

    const competitionImages = files.filter((f) =>
      f.name.includes("march-competition")
    );
    console.log(`${competitionImages.length} competition images found`);

    return competitionImages;
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }
}

async function fetchImageByNamePart(fileNamePart) {
  const files = await imagekit.listFiles({
    searchQuery: `name LIKE "${fileNamePart}%"`, // matches any file that starts with fileNamePart
    limit: 1,
  });

  if (files.length > 0) {
    return files[0]; // returns metadata (url, tags, etc.)
  } else {
    console.warn(`No file found matching: ${fileNamePart}`);
    return null;
  }
}

const failedImages = [];
const main = async (skip = 0, limit = 100) => {
  let totalUploaded = 0;
  let totalFailed = 0;

  while (true) {
    try {
      const data = await fetchFileMetadata(skip, limit);

      if (data.length === 0) break;

      const extracted = await extractProjectInfo(data);
      const newImages = await Promise.allSettled(
        extracted.map(createConnectedImage)
      );
      const successes = newImages.filter(
        (result) => result.status === "fulfilled"
      );
      const errors = newImages.filter((result) => result.status === "rejected");

      totalUploaded += successes.length;
      totalFailed += errors.length;
      failedImages.push(...errors);
    } catch (err) {
      console.error("Error occurred while processing images:", err);
      failedImages.push(err);
    }
    skip += limit;
  }

  await prisma.$disconnect();

  console.log("Total uploaded files: ", totalUploaded);
  console.log("Total failed files: ", totalFailed);
  console.log("Failed images details: ", failedImages);
};

const importMissingImages = async () => {
  const images = await Promise.all(
    missingProjectImages.default.map((i) => fetchImageByNamePart(i.title))
  );
  const extracted = await extractProjectInfo(images);
  const newImages = await Promise.allSettled(
    extracted.map(createConnectedImage)
  );

  const successes = newImages.filter((result) => result.status === "fulfilled");
  const errors = newImages.filter((result) => result.status === "rejected");

  totalUploaded += successes.length;
  totalFailed += errors.length;
  failedImages.push(...errors);
};

main();
console.log("failed:", failedImages);

// importMissingImages();
