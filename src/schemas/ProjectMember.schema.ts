import { z } from "zod";

// Basic schema for adding a member
export const addMemberSchema = z.object({
  projectId: z.number().positive("Project ID must be a positive number"),
  userId: z.number().positive("User ID must be a positive number"),
  role: z.string().optional()  // optional field if you allow specifying a role
});

export const RemoveMemberSchema = z.object({
  projectId: z.number().int().positive(),
  userId: z.number().int().positive()
});