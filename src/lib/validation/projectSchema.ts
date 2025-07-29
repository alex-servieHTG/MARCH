import { z } from "zod";
import {
  BUILDING_TYPOLOGY,
  STAKEHOLDER_TYPE,
  CONSTRUCTION_TYPOLOGY,
} from "@prisma/client";
import { countryNames } from "./countries";

const location = z.object({
  city: z.string().min(1, "City is required"),
  country: z.enum(countryNames, "Country is required"),
  street: z.string().optional(),
  postcode: z.string().optional(),
});

export const materialSchema = z.object({
  materialName: z.string().min(1, "Material name is required"),

  description: z.string().min(5, "Description is required."),

  usedWhere: z
    .string()
    .min(
      1,
      "Please describe where the material is used. Interior / Exterior and on which surface (facade, flooring, etc.)"
    ),

  percentage: z.int().min(1).max(100).optional(),

  url: z.url("Must be a valid URL").optional(),

  tags: z.array(z.string()),

  supplierName: z.string().min(1, "Supplier name is required"),

  supplierContact: z.object({
    url: z.url("Must be a valid URL"),

    email: z.array(z.email()).nullish(),

    phoneNumber: z.array(z.string().min(8).max(25)),

    locations: z.array(location),
  }),

  certifications: z.array(z.string()).nullish(),
});

export const stakeholder = z.object({
  type: z.enum([
    STAKEHOLDER_TYPE.ARCHITECT,
    STAKEHOLDER_TYPE.INTERIOR_ARCHITECT,
    STAKEHOLDER_TYPE.CONTRACTOR,
    STAKEHOLDER_TYPE.ENGINEER,
  ]),

  companyName: z.string().min(2),

  email: z.array(z.email()),

  location,

  phoneNumber: z.array(z.string().min(8).max(19)),
});

export const projectSubmissionSchema = z.object({
  email: z.email("Invalid email address"),

  title: z.string().min(1, "Project title is required"),

  description: z
    .string()
    .min(10, "Project description should be more detailed"),

  location,

  yearCompleted: z
    .number()
    .int("Must be a whole number")
    .gte(1900, "Year must be later than 1900")
    .lte(new Date().getFullYear(), "Year cannot be in the future"),

  typology: z.enum([
    BUILDING_TYPOLOGY.RESIDENTIAL,
    BUILDING_TYPOLOGY.COMMERCIAL,
    BUILDING_TYPOLOGY.MIXED_USE,
    BUILDING_TYPOLOGY.INDUSTRIAL,
    BUILDING_TYPOLOGY.INSTITUTIONAL,
    BUILDING_TYPOLOGY.HEALTHCARE,
  ]),

  materials: z
    .array(materialSchema)
    .min(3, "Please include at least 3 materials"),

  stakeholders: z.array(stakeholder),

  area: z.number().int(),

  imageCredit: z.string(),

  construction: z.enum([
    CONSTRUCTION_TYPOLOGY.NEW,
    CONSTRUCTION_TYPOLOGY.EXTENSION,
    CONSTRUCTION_TYPOLOGY.RENOVATION,
    CONSTRUCTION_TYPOLOGY.RESTORATION,
    CONSTRUCTION_TYPOLOGY.CONVERSION,
  ]),
});
