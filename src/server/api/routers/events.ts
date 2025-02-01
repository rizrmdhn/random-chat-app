// src/server/api/routers/event.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eventEmitter } from "@/server/redis/event-emitter";
import { EVENT_TYPES } from "@/types/event.types";
import { shouldSkipEvent } from "@/utils/event-filters";

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

      for (const type of input.types) {
        const iterable = eventEmitter.toIterable(type, { signal });

        try {
          for await (const event of iterable) {
            if (shouldSkipEvent(type, event, filterContext)) continue;
            yield { type, event };
          }
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            error.message !== "Aborted"
          ) {
            console.error("Subscription error:", error);
          }
        }
      }
    }),

  // Example of a more specific subscription
  subscribeToUserEvents: protectedProcedure.subscription(async function* ({
    ctx,
    signal,
  }) {
    const filterContext = {
      session: ctx.session,
      user: ctx.user,
    };

    const userEvents = [
      "user.created",
      "user.updated",
      "user.deleted",
    ] as const;

    for (const type of userEvents) {
      const iterable = eventEmitter.toIterable(type, { signal });

      try {
        for await (const event of iterable) {
          if (shouldSkipEvent(type, event, filterContext)) continue;
          yield { type, event };
        }
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          error.message !== "Aborted"
        ) {
          console.error("User event subscription error:", error);
        }
      }
    }
  }),
});
