import { z } from "zod";

// Base schema with utility function for date handling
const baseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

// Event-specific schemas
export const schemas = {
  user: baseEventSchema.extend({
    userId: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
  userDeleted: baseEventSchema.extend({
    userId: z.string(),
  }),
  channel: baseEventSchema.extend({
    channelId: z.string(),
  }),
  message: baseEventSchema.extend({
    messageId: z.string(),
    channelId: z.string(),
    userId: z.string(),
    content: z.string(),
  }),
};

export type UserEvent = z.infer<typeof schemas.user>;
export type UserDeletedEvent = z.infer<typeof schemas.userDeleted>;
export type ChannelEvent = z.infer<typeof schemas.channel>;
export type MessageEvent = z.infer<typeof schemas.message>;
