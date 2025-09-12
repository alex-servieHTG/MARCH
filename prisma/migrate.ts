// TODO: ensure that projectSubmissionSchema (and child schemas) match prisma schema so data are properly loaded
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import cliProgress from 'cli-progress';
import { projectSubmissionSchema } from "../src/lib/validation/projectSchema"; // your Zod schema
import { z } from "zod";
import prisma from "../src/lib/prisma";
import {
  parseMaterials,
  parseConstruction,
  parseStakeholder,
  parseTypology,
  parsePhotographer
} from "./parseData";
import { createMaterialsAndConnections } from "./seed";

export async function importProjects(csvPath: string, dryRun: boolean) {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    // delimiter: ";",
    skip_empty_lines: true,
  });
  const typedRecords = records as Array<Record<string, string>>;
  let failedValidations: [Record<string, string>, z.ZodError][] = []

  const validatedSubmissions = typedRecords.flatMap(row => {
    try {
      const email = row["Email"];
      const title = row["Project Name"];
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
        stakeholders: [parseStakeholder(row)].concat(parsePhotographer(row)),
        area: parseInt(row["Project Built Area"]),
        imageCredit: row["Image Rights"],
        construction: parseConstruction(
          row["Construction Type (select all that apply)"]
        ),
      };
      const validated = projectSubmissionSchema.parse(submission);
      return [validated]
    } catch (error) {
      if (error instanceof z.ZodError) {
        failedValidations.push([row, error])
      } else {
        console.error("Failed to import row:", row["Project Name"], error);
      }
      return []
    }
  })

  if (dryRun) {
    fs.writeFileSync("validatedSubmissions.json", JSON.stringify(validatedSubmissions, null, 2))
    const [totalMaterials, materialsWithNoUrl] = validatedSubmissions.reduce((acc, project) => project.materials.reduce((acc, material) => {
      let [t, u] = acc;
      t += 1
      if (!material?.supplierContact.url) { u += 1 }
      return [t, u]

    }, acc), [0, 0])
    console.log(`totalMaterials=${totalMaterials}, materialsWithNoUrl=${materialsWithNoUrl}`)
    console.log(`validation failed for ${failedValidations.length} projects`)
    for (const failedValidation of failedValidations) {
      console.log(failedValidation)
    }
    return
  }

  if (failedValidations.length > 0) {
    console.error("Validation failed for some projects; not inserting data!")
    for (const failedValidation of failedValidations) {
      console.error(failedValidation)
    }
    return
  }

  let failedDbTransactions = []
  let projects = []
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(validatedSubmissions.length, 0);
  for (const validated of validatedSubmissions) {
    try {
      // const existingRecord = await prisma.project.findFirst({
      //   where: {
      //     AND: [{ author: { email } }, { title }],
      //   },
      // });
      // if (existingRecord) {
      //   console.log(
      //     `Record with email ${email} and title ${title} already exists`
      //   );
      //   continue;
      // }
      // --- Upsert user-- -
      const user = await prisma.user.upsert({
        where: { email: validated.email },
        update: {},
        create: { email: validated.email },
      });

      // --- Create project-- -
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
          stakeholders: {
            create: [...validated.stakeholders],
          },
        },
      });

      await createMaterialsAndConnections(validated.materials, project.id);
      projects.push(project)
      bar.increment()
    } catch (error) {
      failedDbTransactions.push(error)
    }
  }
  bar.stop()
  if (failedDbTransactions.length > 0) {
    for (const failedDbTransaction of failedDbTransactions) {
      console.error(failedDbTransaction)
    }
  }

  console.log(`inserted ${projects.length} projects`)
  await prisma.$disconnect();
}

// Run script
const csvFile = path.resolve(process.argv[2] || "jotformData.csv");
importProjects(csvFile, false);
