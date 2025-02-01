import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createChannel,
  getChannelList,
} from "@/server/queries/channels.queries";

export const channelRouter = createTRPCRouter({
  getChannels: publicProcedure.query(async () => {
    return await getChannelList();
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input: { name } }) => {
      return await createChannel(name);
    }),
});
