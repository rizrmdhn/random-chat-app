import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createMessage,
  getMessageByChannelId,
} from "@/server/queries/messages.queries";

export const messageRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      }),
    )
    .query(async ({ input: { channelId } }) => {
      return await getMessageByChannelId(channelId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input: { channelId, content }, ctx }) => {
      const message = await createMessage(channelId, ctx.user.id, content);

      await ctx.eventBus.publish("message.sent", {
        channelId,
        message: message.message,
        messageId: message.id,
        userId: ctx.user.id,
      });

      return message;
    }),
});
