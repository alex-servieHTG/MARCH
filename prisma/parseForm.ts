import fs from "fs";
import csv from "csv-parser";

const input = "src/tests/jotformData.csv";
const output = "src/tests/jotformData.json";

type Project = {
  title: string;
  email: string;
  description: string;
  location: {
    street: string;
    city: string;
    country: string;
    postcode: string;
  };
  yearCompleted: number;
  typology: string;
  construction: string;
  area: number;
  imageCredit: string;
  materials: Material[];
  stakeholders: Stakeholder[];
};

type Material = {
  materialName: string;
  description: string;
  usedWhere: string;
  tags: string[];
  url: string;
  supplierName: string;
  supplierContact: {
    url: string;
    email: string[];
    phoneNumber: string[];
    locations: string[];
  };
};

type Stakeholder = {
  type: string;
  companyName: string;
  email: string[];
  phoneNumber: string[];
  location: {
    street: string;
    city: string;
    country: string;
    postcode: string;
  };
};

const projects: Project[] = [];

fs.createReadStream(input)
  .pipe(csv())
  .on("data", (row) => {
    const [street, cityCountry] = row["Address"]?.split(",") ?? [];
    const [city, country] = cityCountry?.trim().split(" ") ?? [];

    const project = {
      title: row["Project Name"] ?? "Untitled",
      email: row["Email"] ?? "unknown@example.com",
      description: row["Short Project Description"] ?? "",
      location: {
        street: street?.trim() ?? "",
        city: city ?? "",
        country: country ?? "",
        postcode: "",
      },
      yearCompleted: parseInt(row["Year of Project Completion"]) || 2025,
      typology: mapTypology(row["Project Typology (select all that apply)"]),
      construction: mapConstruction(row["Construction Type (select all that apply)"]),
      area: parseInt(row["Project Built Area"]) || 0,
      imageCredit: row["Image Credits"] ?? "",
      materials: parseMaterials(row["List Materials"]),
      stakeholders: [
        {
          type: "ARCHITECT",
          companyName: row["Company name"] ?? "",
          email: [row["Email"] ?? ""],
          phoneNumber: [],
          location: {
            street: street?.trim() ?? "",
            city: city ?? "",
            country: country ?? "",
            postcode: "",
          },
        },
      ],
    };

    projects.push(project);
  })
  .on("end", () => {
    fs.writeFileSync(output, JSON.stringify(projects, null, 2));
    console.log(`Parsed ${projects.length} projects into ${output}`);
  });

function mapTypology(raw: string = ""): string {
  const val = raw.toLowerCase();
  if (val.includes("residential")) return "RESIDENTIAL";
  if (val.includes("commercial")) return "COMMERCIAL";
  if (val.includes("mixed")) return "MIXED_USE";
  if (val.includes("industry")) return "INDUSTRIAL";
  if (val.includes("health")) return "HEALTHCARE";
  return "INSTITUTIONAL";
}

function mapConstruction(raw: string = ""): string {
  const val = raw.toUpperCase();
  if (val.includes("RENOVATION")) return "RENOVATION";
  if (val.includes("RESTORATION")) return "RESTORATION";
  if (val.includes("CONVERSION")) return "CONVERSION";
  if (val.includes("EXTENSION")) return "EXTENSION";
  return "NEW";
}

function parseMaterials(raw: string = ""): Material[] {
  const matches = [...raw.matchAll(/Name Material:\s*(.+?),\s*Name Supplier:\s*(.+?)(,|$)/g)];
  return matches.map((match) => {
    const materialName = match[1];
    const supplierName = match[2];
    return {
      materialName,
      description: "",
      usedWhere: "",
      tags: [],
      url: "",
      supplierName,
      supplierContact: {
        url: "",
        email: [],
        phoneNumber: [],
        locations: [],
      },
    };
  });
}