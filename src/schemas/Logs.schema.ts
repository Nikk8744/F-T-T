import { z } from 'zod';

export const StartTimeLogSchema = z.object({});

export const StopTimeLogSchema = z.object({
    projectId: z.number().int().positive(),
    taskId: z.number().int().positive(),
    name: z.string().optional(),
    description: z.string().optional()
});

// export const UpdateTimeLogSchema = z.object({
//   startTime: z.string().datetime().optional(),
//   endTime: z.string().datetime().optional()
// }).refine(data => !(data.endTime && !data.startTime), {
//   message: "Can't have endTime without startTime"
// });
export const UpdateTimeLogSchema = z.object({
    taskId: z.number().int().positive().optional(),
    projectId: z.number().int().positive().optional(),
    name: z.string().optional(),
    description: z.string().optional()
  });

  