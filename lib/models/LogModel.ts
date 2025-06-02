import { z } from 'zod';

export const LogSchema = z.object({
  _id: z.string().optional(),
  action: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string(),
  serverId: z.string().optional(),
  createdAt: z.date().optional()
});

export type Log = z.infer<typeof LogSchema>;