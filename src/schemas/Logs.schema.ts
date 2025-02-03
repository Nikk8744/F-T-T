import { z } from 'zod';

export const StartTimeLogSchema = z.object({});

export const StopTimeLogSchema = z.object({
    projectId: z.number().int().positive(),
    taskId: z.number().int().positive(),
    name: z.string().optional(),
    description: z.string().optional()
});

// export const UpdateTimeLogSchema = z.object({
//     taskId: z.number().int().positive().optional(),
//     projectId: z.number().int().positive().optional(),
//     name: z.string().optional(),
//     description: z.string().optional()
//   });

  export const UpdateTimeLogSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255).optional(),
    description: z.string().max(1000).optional(),
    taskId: z.number().int().positive().optional(),
    projectId: z.number().int().positive().optional(),
    startTime: z.string().datetime({ message: "start date format galat hai bhai" }).optional(),
    endTime: z.string().datetime({ message: "end date format galat hai bhai" }).optional()
    }).refine(data => {
    // Ensure endTime is after startTime if both are provided
        if (data.startTime && data.endTime) {
            return new Date(data.endTime) > new Date(data.startTime);
        }
        return true;
        }, {
            message: "End time must be after start time buddy",
        }
    );
  