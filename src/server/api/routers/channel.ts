import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createChannel,
  getChannelList,
} from "@/server/queries/channels.queries";

export const channelRouter = createTRPCRouter({
  getChannels: protectedProcedure.query(async () => {
    return await getChannelList();
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { name } }) => {
      const channel = await createChannel(name);

      await ctx.eventBus.publish("channel.created", {
        channelId: channel.id,
        name: channel.name,
      });

      return;
    }),
});
