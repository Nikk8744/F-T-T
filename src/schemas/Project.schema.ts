import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(3, "Project name should be min 3 characters").max(255, "Project name shoould not exceed 255 characters").trim(),
    description: z.string().min(5, "Project description should be min 5 characters").max(1000, "Project description should not exceed 1000 characters").trim().optional(),
    // startDate: z.string().datetime({ message: "Invalid start date" }),
    // endDate: z.string().datetime({ message: "Invalid end date" }),
    startDate: z.string()
    .transform((val) => new Date(val)),
    // .refine((value) => !isNaN(Date.parse(value)), {
    //   message: "Invalid start date",
    // }),
    endDate: z.string().transform((val) => new Date(val)),
    // .refine((value) => !isNaN(Date.parse(value)), {
    //   message: "Invalid end date",
    // }),
    status: z.enum(['Pending', 'In-Progress', 'Completed']).default('Pending'),
    totalHours: z.number().default(0),
})

export const updateProjectSchema = z.object({
    id: z.number().int().positive(),
    name: z.string()
      .min(3, "Project name should be min 3 characters")
      .max(255, "Project name should not exceed 255 characters")
      .trim()
      .optional(),
    description: z.string()
      .min(5, "Project description should be min 5 characters")
      .max(1000, "Project description should not exceed 1000 characters")
      .trim()
      .optional(),
    startDate: z.string()
      .datetime({ message: "Invalid ISO date format" })  // First validate format
      .transform((val) => new Date(val))  // Then convert to Date object
      .optional(),
    endDate: z.string()
      .datetime({ message: "Invalid ISO date format" })
      .transform((val) => new Date(val))
      .optional(),
    status: z.enum(['Pending', 'In-Progress', 'Completed'])
      .default('Pending')
      .optional(),
    totalHours: z.number()
      .nonnegative("Total hours cannot be negative")
      .optional()
  });
