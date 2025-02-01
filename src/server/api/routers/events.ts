import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { EVENT_TYPES } from "@/types/event.types";

export const eventRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        types: z.array(z.enum(EVENT_TYPES)),
      }),
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const filterContext = {
        session: ctx.session,
        user: ctx.user,
      };

      try {
        for await (const event of ctx.eventBus.subscribe(
          input.types,
          filterContext,
          signal,
        )) {
          yield event;
        }
      } catch (error) {
        if (error instanceof Error && error.message !== "Aborted") {
          console.error("Subscription error:", error);
        }
      }
    }),
});
