import z from "zod";

export const UserCreateSchema = z.object({
    name: z.string().min(1, 'Name is requird').max(255).trim(),
    userName: z.string().min(3, "Username must be atleast 3 characters").max(255).trim(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(5).trim(),
    role: z.enum(['user', 'admin']).default('user').optional(),
    refreshToken: z.string().optional().nullable(),
})


export const UserUpdateSchema = UserCreateSchema
  .omit({ password: true })  // Typically handle password updates separately
  .extend({
    name: z.string().max(255).trim().optional(),
    userName: z.string().min(3).max(255).trim().optional(),
    email: z.string().email().max(255).trim().optional(),
    role: z.enum(['user', 'admin']).optional()
  })
  .strict();