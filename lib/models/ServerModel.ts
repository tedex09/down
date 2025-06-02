import { z } from 'zod';

export const ServerSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  url: z.string().url("Must be a valid URL"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  active: z.boolean(),
  lastChecked: z.date().optional(),
  status: z.enum(['online', 'offline', 'unknown']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type Server = z.infer<typeof ServerSchema>;