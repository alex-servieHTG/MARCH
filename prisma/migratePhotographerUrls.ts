import fs from "fs";
import { parse } from "csv-parse/sync";
import prisma from "../src/lib/prisma";
import cliProgress from 'cli-progress';
import { parsePhotographer } from "./parseData";
import { stakeholder } from "../src/lib/validation/projectSchema"; // your Zod schema

async function main(csvPath: string) {
    const raw = fs.readFileSync(csvPath, "utf-8");
    const records = parse(raw, {
        columns: true,
        // delimiter: ";",
        skip_empty_lines: true,
    });
    const typedRecords = records as Array<Record<string, string>>;
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(typedRecords.length, 0);

    for (const row of typedRecords) {
        const title = row["Project Name"];
        // we don't have any existing photographers; add
        const photographersValidated = parsePhotographer(row).map(s => stakeholder.parse(s))
        const update = {
            stakeholders: { create: photographersValidated },
            imageCredit: row["Image Rights"],
        }
        const project = await prisma.project.findFirst({ where: { title } })
        if (project === null) {
            throw new Error(`Couldn't find project with title ${title}`)
        }
        await prisma.project.update({ where: { id: project.id }, data: update })
        bar.increment()
    }
    bar.stop()
}

main("jotformData.11-09-2025.csv")