import { z } from "zod";

export const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
  educationRequirement: z.string().min(1, "Education requirement is required"),
  experience: z.string().min(1, "Experience is required"),
  experienceYears: z.number(),
  skills: z.string().min(1, "Skills are required"),
  additionalRequirements: z.string().optional(),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  minimumAge: z.number(),
  maximumAge: z.number(),
});

export type JobFormType = z.infer<typeof JobSchema>;
