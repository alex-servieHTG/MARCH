import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { projectSubmissionSchema } from "../src/lib/validation/projectSchema"; // your Zod schema
import { z } from "zod";
import prisma from "../src/lib/prisma";
import {
  parseMaterials,
  parseConstruction,
  parseStakeholder,
  parseTypology,
} from "./parseData";
import { createMaterialsAndConnections } from "./seed";

export async function importProjects(csvPath: string) {
  console.log("IMPORT BEGIN");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    // delimiter: ";",
    skip_empty_lines: true,
  });
  const typedRecords = records as Array<Record<string, string>>;
  for (const row of typedRecords) {
    try {
      const email = row["Email"];
      const title = row["Project Name"];
      const existingRecord = await prisma.project.findFirst({
        where: {
          AND: [{ author: { email } }, { title }],
        },
      });
      if (existingRecord) {
        console.log(
          `Record with email ${email} and title ${title} already exists`
        );
        continue;
      }
      // Prepare the object for validation
      const submission = {
        email,
        title,
        description: row["Short Project Description"],
        location: row["Project Location (Europe or UK)"],
        yearCompleted: parseInt(row["Year of Project Completion"])
          ? parseInt(row["Year of Project Completion"])
          : 2025,
        typology: parseTypology(
          row["Project Typology (select all that apply)"]
        ),
        materials: parseMaterials(row["List Materials"]),
        stakeholders: [parseStakeholder(row as Record<string, string>)],
        area: parseInt(row["Project Built Area"]),
        imageCredit: row["Photographer"],
        photographerUrl: row["Photographer URL"],
        construction: parseConstruction(
          row["Construction Type (select all that apply)"]
        ),
      };
      console.log("submission:", submission.construction);

      // --- Validate with Zod ---
      const validated = projectSubmissionSchema.parse(submission);

      // --- Upsert user ---
      const user = await prisma.user.upsert({
        where: { email: validated.email },
        update: {},
        create: { email: validated.email },
      });

      // --- Create project ---
      const project = await prisma.project.create({
        data: {
          title: validated.title,
          description: validated.description,
          yearCompleted: validated.yearCompleted,
          typology: validated.typology,
          area: validated.area,
          construction: validated.construction,
          location: validated.location,
          authorId: user.id,
          imageCredit: validated.imageCredit,
          photographerUrl: validated.photographerUrl,
          stakeholders: {
            create: [...validated.stakeholders],
          },
        },
      });

      await createMaterialsAndConnections(validated.materials, project.id);

      console.log(`Imported project: ${validated.title}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation failed for row:", row["Project Name"], error);
      } else {
        console.error("Failed to import row:", row["Project Name"], error);
      }
    }
  }

  await prisma.$disconnect();
}

// Run script
const csvFile = path.resolve(process.argv[2] || "jotformData.csv");
importProjects(csvFile);
