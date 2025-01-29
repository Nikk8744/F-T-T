import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(3, "Project name should be min 3 characters").max(255, "Project name shoould not exceed 255 characters").trim(),
    description: z.string().min(5, "Project description should be min 5 characters").max(1000, "Project description should not exceed 1000 characters").trim().optional(),
    // startDate: z.string().datetime({ message: "Invalid start date" }),
    // endDate: z.string().datetime({ message: "Invalid end date" }),
    startDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    endDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    status: z.enum(['Pending', 'In-Progress', 'Completed']).default('Pending'),
    totalHours: z.number().default(0),
})

export const updateProjectSChema = z.object({
    name: z.string().min(3, "Project name should be min 3 characters").max(255, "Project name shoould not exceed 255 characters").trim().optional(),
    description: z.string().min(5, "Project description should be min 5 characters").max(1000, "Project description should not exceed 1000 characters").trim().optional(),
    startDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }).optional(),
    status: z.enum(['Pending', 'In-Progress', 'Completed']).default('Pending').optional(),
    totalHours: z.number().default(0).optional(),
})

