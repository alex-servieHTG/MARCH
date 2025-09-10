import { z } from "zod";
import { materialSchema } from "../src/lib/validation/projectSchema";
import {
  CONSTRUCTION_TYPOLOGY,
  Stakeholder,
  STAKEHOLDER_TYPE,
  BUILDING_TYPOLOGY,
} from "@prisma/client";

type MaterialInput = z.infer<typeof materialSchema>;

export function parseMaterial(entry: string): MaterialInput | z.ZodError {
  const nameMatch = entry.match(/^(.*?),/);
  const name = nameMatch ? nameMatch[1].trim() : "Unknown Material";

  const supplierMatch = entry.match(/Name Supplier:\s*([^,]+),?/);
  const supplierName = supplierMatch
    ? supplierMatch[1].trim()
    : "Unknown Supplier";

  const usedWhereMatch = entry.match(
    /Describe where the material is used:\s*([^,]+),?/
  );
  const usedWhere = usedWhereMatch ? usedWhereMatch[1].trim() : "Unknown";

  const categoriesMatch = entry.match(
    /Select all applicable material categories:\s*([^\n,]+(?:[,|\n]\s*[^\n,]+)*)Describe/
  );
  const tags = categoriesMatch
    ? categoriesMatch[1]
      .split(/[,|\n]/)
      .map((t) => t.trim())
      .filter(Boolean)
    : [];

  const percentageMatch = entry.match(
    /Estimate what % of the project is built with this material:\s*(\d+)%?/
  );
  const percentage = percentageMatch
    ? parseInt(percentageMatch[1], 10)
    : undefined;

  let supplierUrlMatch = entry.match(/URL:\s*([^,]+),?/);
  let url = supplierUrlMatch ? supplierUrlMatch[1].trim() : null;
  // sometimes the data don't have "URL" in the data; the URL just comes directly after the percentage
  if (url === null) {
    supplierUrlMatch = entry.match(/https?:\/\/\S+$/);
    url = supplierUrlMatch ? supplierUrlMatch[0].trim() : null;
  }

  try {
    return materialSchema.parse({
      materialName: name,
      usedWhere,
      percentage,
      tags,
      supplierName,
      url,
      supplierContact: {
        url,
        email: null,
        phoneNumber: [],
        locations: [],
      },
      certifications: [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error
    }
  }
}

export function parseMaterials(raw: string): MaterialInput[] {
  const entries = raw
    .split(/Name Material:/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return entries.map(parseMaterial).filter((m): m is MaterialInput => !(m instanceof z.ZodError))
}

const constructionMap: Record<string, CONSTRUCTION_TYPOLOGY> = {
  "New Build": CONSTRUCTION_TYPOLOGY.NEW,
  Restoration: CONSTRUCTION_TYPOLOGY.RESTORATION,
  "Conversion / Adaptive Reuse": CONSTRUCTION_TYPOLOGY.CONVERSION,
  "Extension / Addition": CONSTRUCTION_TYPOLOGY.EXTENSION,
  Renovation: CONSTRUCTION_TYPOLOGY.RENOVATION,
};

export const parseConstruction = (raw: string): CONSTRUCTION_TYPOLOGY[] => {
  // console.log("parsing Construction", raw);
  return raw
    .split("\n")
    .map((v) => v.trim())
    .map((v) => constructionMap[v])
    .filter(Boolean) as CONSTRUCTION_TYPOLOGY[];
};

const stakeholderTypeMap: Record<string, STAKEHOLDER_TYPE> = {
  Architecture: STAKEHOLDER_TYPE.ARCHITECT,
  "Interior Architecture": STAKEHOLDER_TYPE.INTERIOR_ARCHITECT,
  Contractor: STAKEHOLDER_TYPE.CONTRACTOR,
  Engineer: STAKEHOLDER_TYPE.ENGINEER,
};

export function parseStakeholder(
  row: Record<string, string>
): Partial<Stakeholder> {
  const rawTypes = String(
    row["Professional Scope (your role in this project, select all that apply)"]
  )
    .split(/[,;\n]/)
    .map((t) => t.trim());

  const mappedType = rawTypes
    .map((t) => stakeholderTypeMap[t])
    .filter((t) => t);
  const companyName = row["Architect"]?.trim();
  const email = row["Email"] ? [row["Email"].trim()] : [];
  const location = row["Address"];
  return {
    type: mappedType,
    companyName,
    email,
    url: row["Architect URL"]?.trim() || null,
    location,
    phoneNumber: [],
  };
}

const typologyMap: Record<string, BUILDING_TYPOLOGY> = {
  Residential: BUILDING_TYPOLOGY.RESIDENTIAL,
  Commercial: BUILDING_TYPOLOGY.COMMERCIAL,
  "Mixed-use": BUILDING_TYPOLOGY.MIXED_USE,
  Industrial: BUILDING_TYPOLOGY.INDUSTRIAL,
  "Institutional / Public": BUILDING_TYPOLOGY.INSTITUTIONAL,
};

export const parseTypology = (raw: string) => {
  return raw
    .split("\n")
    .map((v) => v.trim())
    .map((v) => typologyMap[v])
    .filter(Boolean) as BUILDING_TYPOLOGY[];
};
