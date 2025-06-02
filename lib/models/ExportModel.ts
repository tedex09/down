import { z } from 'zod';

export const ExportSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  links: z.array(z.string().url()),
  serverId: z.string(),
  createdAt: z.date().optional()
});

export type Export = z.infer<typeof ExportSchema>;