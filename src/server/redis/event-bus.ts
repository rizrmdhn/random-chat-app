import "server-only";

import { Redis, type RedisOptions } from "ioredis";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { EVENT_TYPES } from "@/types/event.types";
import type { EventType, EventMap } from "@/types/event.types";
import { type Session, type SessionUser } from "../auth";
import redisConfig from "./config";

const REDIS_CHANNEL = "events";

type FilterContext = {
  session: Session;
  user: SessionUser;
};

const eventSchema = z.object({
  type: z.enum(EVENT_TYPES),
  payload: z.unknown(),
});

export class EventBus {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(config: RedisOptions) {
    this.publisher = new Redis(config);
    this.subscriber = new Redis(config);
  }

  async *subscribe<T extends EventType>(
    types: T[],
    context: FilterContext,
    signal?: AbortSignal,
  ): AsyncIterableIterator<{ type: T; payload: EventMap[T] }> {
    await this.subscriber.subscribe(REDIS_CHANNEL);

    try {
      while (!signal?.aborted) {
        const [channel, message] = await new Promise<[string, string]>(
          (resolve, reject) => {
            const messageHandler = (chan: string, msg: string) => {
              cleanup();
              resolve([chan, msg]);
            };

            const errorHandler = (err: Error) => {
              cleanup();
              reject(err);
            };

            const cleanup = () => {
              this.subscriber.removeListener("message", messageHandler);
              this.subscriber.removeListener("error", errorHandler);
            };

            this.subscriber.once("message", messageHandler);
            this.subscriber.once("error", errorHandler);

            signal?.addEventListener("abort", () => {
              cleanup();
              reject(new Error("Aborted"));
            });
          },
        );

        if (channel !== REDIS_CHANNEL) continue;

        try {
          const data = JSON.parse(message) as unknown;
          const parsed = eventSchema.parse(data);

          if (!types.includes(parsed.type as T)) continue;

          // Type guard for the payload
          if (!isValidPayload(parsed.type, parsed.payload)) continue;

          // Skip if should filter
          if (shouldSkipEvent(parsed.type, parsed.payload, context)) continue;

          yield {
            type: parsed.type as T,
            payload: parsed.payload as EventMap[T],
          };
        } catch (error) {
          console.error("Failed to parse message:", error);
          continue;
        }
      }
    } finally {
      await this.subscriber.unsubscribe(REDIS_CHANNEL);
    }
  }

  async publish<T extends EventType>(
    type: T,
    payload: Omit<EventMap[T], "id" | "timestamp">,
  ): Promise<void> {
    const event = {
      type,
      payload: {
        ...payload,
        id: uuidv4(),
        timestamp: new Date(),
      },
    };

    await this.publisher.publish(REDIS_CHANNEL, JSON.stringify(event));
  }

  async cleanup(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

// Type guard for event payloads
function isValidPayload<T extends EventType>(
  type: T,
  payload: unknown,
): payload is EventMap[T] {
  if (!payload || typeof payload !== "object") return false;

  switch (type) {
    case "user.created":
    case "user.updated":
      return (
        "userId" in payload &&
        "email" in payload &&
        "name" in payload &&
        "id" in payload &&
        "timestamp" in payload
      );
    case "user.deleted":
      return "userId" in payload && "id" in payload && "timestamp" in payload;
    default:
      return false;
  }
}

// Event filtering logic
function shouldSkipEvent<T extends EventType>(
  type: T,
  payload: EventMap[T],
  context: FilterContext,
): boolean {
  switch (type) {
    case "user.created":
    case "user.updated":
    case "user.deleted":
      return "userId" in payload && payload.userId === context.user.id;
    default:
      return false;
  }
}

// Create singleton instance
export const eventBus = new EventBus(redisConfig);
