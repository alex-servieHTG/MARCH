import { z } from "zod";
import {
  BUILDING_TYPOLOGY,
  STAKEHOLDER_TYPE,
  CONSTRUCTION_TYPOLOGY,
} from "@prisma/client";

export const materialSchema = z
  .object({
    materialName: z.string().min(1, "Material name is required"),

    description: z.string().optional(),

    usedWhere: z
      .string()
      .min(
        1,
        "Please describe where the material is used. Interior / Exterior and on which surface (facade, flooring, etc.)"
      ),

    percentage: z.int().min(1).max(100).optional(),

    url: z.url("Must be a valid URL").optional().nullish(),

    tags: z.array(z.string()),

    supplierName: z.string().min(1, "Supplier name is required"),

    supplierContact: z.object({
      url: z.url("Must be a valid URL").optional().nullish(),

      email: z.array(z.email()).nullish(),

      phoneNumber: z.array(z.string().min(8).max(25)).nullish(),

      locations: z.array(z.string()).optional().nullish(),
    }),

    certifications: z.array(z.string()).nullish(),
  })
  .optional();

export const stakeholder = z.object({
  type: z.array(
    z.enum([
      STAKEHOLDER_TYPE.ARCHITECT,
      STAKEHOLDER_TYPE.INTERIOR_ARCHITECT,
      STAKEHOLDER_TYPE.CONTRACTOR,
      STAKEHOLDER_TYPE.ENGINEER,
      STAKEHOLDER_TYPE.PHOTOGRAPHER
    ])
  ),

  companyName: z.string().min(2),

  email: z.array(z.email()),

  location: z.string().optional().nullish(),

  phoneNumber: z.array(z.string().min(8).max(19)),

  url: z.url("Must be a valid URL").optional().nullish(),
});

export const projectSubmissionSchema = z.object({
  email: z.email("Invalid email address"),

  title: z.string().min(1, "Project title is required"),

  description: z.string().min(0, "should at least be empty string"),

  location: z.string().optional(),

  yearCompleted: z
    .number()
    .int("Must be a whole number")
    .gte(1900, "Year must be later than 1900")
    .lte(new Date().getFullYear(), "Year cannot be in the future"),

  typology: z.array(
    z.enum([
      BUILDING_TYPOLOGY.RESIDENTIAL,
      BUILDING_TYPOLOGY.COMMERCIAL,
      BUILDING_TYPOLOGY.MIXED_USE,
      BUILDING_TYPOLOGY.INDUSTRIAL,
      BUILDING_TYPOLOGY.INSTITUTIONAL,
      BUILDING_TYPOLOGY.HEALTHCARE,
      BUILDING_TYPOLOGY.OTHER,
    ])
  ),

  materials: z
    .array(materialSchema)
    .min(1, "Please include at least 1 material"),

  stakeholders: z.array(stakeholder),

  area: z.number().int(),

  imageCredit: z.string().optional(),

  construction: z.array(
    z.enum([
      CONSTRUCTION_TYPOLOGY.NEW,
      CONSTRUCTION_TYPOLOGY.EXTENSION,
      CONSTRUCTION_TYPOLOGY.RENOVATION,
      CONSTRUCTION_TYPOLOGY.RESTORATION,
      CONSTRUCTION_TYPOLOGY.CONVERSION,
    ])
  ),

  photographerUrl: z.string().url().optional(),
});
