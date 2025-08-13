// scripts/parseJotformCsv.ts
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
  materials: Array<{
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
  }>;
  stakeholders: Array<{
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
  }>;
};

const projects: Project[] = [];

fs.createReadStream(input)
  .pipe(csv())
  .on("data", (row) => {
    const [street, postcodeAndCountry = ""] = row["Address"]?.split(",") ?? [];
    const [postcode, ...countryParts] = postcodeAndCountry.trim().split(" ");
    const country = countryParts.join(" ");

    const [city = ""] = row["Project Location (Europe or UK)"]?.split(" ") ?? [];

    const project = {
      title: row["Project Name"] ?? "Untitled",
      email: row["Email"] ?? "unknown@example.com",
      description: row["Short Project Description"] ?? "",
      location: {
        street: street.trim(),
        city: city.trim(),
        country: country.trim(),
        postcode: postcode?.trim() ?? "",
      },
      yearCompleted: parseInt(row["Year of Project Completion"]) || 2025,
      typology: "INSTITUTIONAL", // You can map from raw if needed
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
            street: street.trim(),
            city: city.trim(),
            country: country.trim(),
            postcode: postcode?.trim() ?? "",
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

function mapConstruction(raw: string = ""): string {
  const val = raw.toUpperCase();
  if (val.includes("RENOVATION")) return "RENOVATION";
  if (val.includes("RESTORATION")) return "RESTORATION";
  if (val.includes("CONVERSION")) return "CONVERSION";
  if (val.includes("EXTENSION")) return "EXTENSION";
  return "NEW";
}

function parseMaterials(raw: string = "") {
  const materialRegex = /Name Material:\s*(.+?),\s*Name Supplier:\s*(.+?),.*?Describe where the material is used:\s*(.+?),/g;

  const matches = [...raw.matchAll(materialRegex)];
  return matches.map(([, materialName, supplierName, usedWhere]) => ({
    materialName: materialName.trim(),
    description: "",
    usedWhere: usedWhere.trim(),
    tags: [],
    url: "",
    supplierName: supplierName.trim(),
    supplierContact: {
      url: "",
      email: [],
      phoneNumber: [],
      locations: [],
    },
  }));
}
