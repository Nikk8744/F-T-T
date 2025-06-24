import { z } from 'zod';

// Define a schema for checklist items - can be either a string or an object
const ChecklistItemSchema = z.union([
  // Simple string format
  z.string().min(1, "Item cannot be empty").max(255),
  // Object format with item and optional isCompleted
  z.object({
    item: z.string().min(1, "Item cannot be empty").max(255),
    isCompleted: z.boolean().optional().default(false)
  })
]);

export const TaskCreateSchema = z.object({
  subject: z.string().min(3).max(50),
  description: z.string().optional(),
  status: z.enum(['Pending', 'In-Progress', 'Done']).default('Pending'),
  // startDate: z.string(),
  dueDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  // projectId: z.number().int().positive(),
  ownerId: z.number().int().positive().optional(),
  checklistItems: z.array(ChecklistItemSchema).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  completedAt: z.string().datetime().transform((val) => new Date(val)).optional().nullable(),
});

export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  // id: z.number().int().positive()
});


// task checklist validation schemas
export const CreateChecklistItemSchema = z.object({
  taskId: z.number().int().positive(),
  item: z.string().min(1, "Item cannot be empty").max(255)
});

export const UpdateChecklistItemSchema = z.object({
  item: z.string().min(1, "Item cannot be empty").max(255).optional(),
  isCompleted: z.boolean().optional()
});