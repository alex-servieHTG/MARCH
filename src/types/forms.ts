import { z } from "zod";
import {
  materialSchema,
  projectSubmissionSchema,
} from "@/lib/validation/projectSchema";

export type ProjectSubmissionForm = z.infer<typeof projectSubmissionSchema>;

export type materialSubmission = z.infer<typeof materialSchema>;

export interface Contact {
  url: string;
  email: Array<string>;
  phoneNumber: Array<string>;
  location: string;
}
