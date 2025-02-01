import { z } from "zod";

const baseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
});

const userEventSchema = baseEventSchema.extend({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
});

const userDeletedEventSchema = baseEventSchema.extend({
  userId: z.string(),
});

const postEventSchema = baseEventSchema.extend({
  postId: z.string(),
  title: z.string(),
  authorId: z.string(),
});

const postDeletedEventSchema = baseEventSchema.extend({
  postId: z.string(),
});

export {
  userEventSchema,
  userDeletedEventSchema,
  postEventSchema,
  postDeletedEventSchema,
};
