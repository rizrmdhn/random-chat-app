import { relations } from "drizzle-orm";
import { messages, users } from "./schema";

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));
