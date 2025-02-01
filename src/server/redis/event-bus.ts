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

// Base schema with utility function for date handling
const baseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

// Event-specific schemas
const schemas = {
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

const eventSchemas: Record<EventType, z.ZodType> = {
  "user.created": schemas.user,
  "user.updated": schemas.user,
  "user.deleted": schemas.userDeleted,
  "channel.created": schemas.channel,
  "message.sent": schemas.message,
  "message.received": schemas.message,
  "message.deleted": schemas.message,
  "message.updated": schemas.message,
} as const;

export class EventBus {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(config: RedisOptions) {
    this.publisher = new Redis(config);
    this.subscriber = new Redis(config);
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    this.publisher.on("error", (err) => {
      console.error("Redis Publisher Error:", err);
    });

    this.subscriber.on("error", (err) => {
      console.error("Redis Subscriber Error:", err);
    });
  }

  private async *createMessageIterator(
    signal?: AbortSignal,
  ): AsyncIterableIterator<string> {
    while (!signal?.aborted) {
      try {
        const [channel, message] = await new Promise<[string, string]>(
          (resolve, reject) => {
            const cleanup = () => {
              this.subscriber.removeListener("message", messageHandler);
              this.subscriber.removeListener("error", errorHandler);
            };

            const messageHandler = (chan: string, msg: string) => {
              cleanup();
              resolve([chan, msg]);
            };

            const errorHandler = (err: Error) => {
              cleanup();
              reject(err);
            };

            this.subscriber.once("message", messageHandler);
            this.subscriber.once("error", errorHandler);

            signal?.addEventListener("abort", () => {
              cleanup();
              reject(new Error("Aborted"));
            });
          },
        );

        if (channel === REDIS_CHANNEL) {
          yield message;
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Aborted") break;
        console.error("Redis subscription error:", error);
      }
    }
  }

  private parseAndValidateEvent<T extends EventType>(
    message: string,
    allowedTypes: T[],
  ): { type: T; payload: EventMap[T] } | null {
    try {
      const data = JSON.parse(message) as unknown;
      console.log("Received event data:", data);

      const parsed = z
        .object({
          type: z.enum(EVENT_TYPES),
          payload: z.unknown(),
        })
        .parse(data);

      console.log("Parsed event:", parsed);

      if (!allowedTypes.includes(parsed.type as T)) {
        console.log("Event type not in subscription list:", parsed.type);
        return null;
      }

      const schema = eventSchemas[parsed.type];
      const result = schema.safeParse(parsed.payload);

      if (!result.success) {
        console.error(
          `Invalid payload for ${parsed.type}:`,
          result.error.errors,
        );
        return null;
      }

      return {
        type: parsed.type as T,
        payload: result.data as EventMap[T],
      };
    } catch (error) {
      console.error("Failed to parse message:", error);
      return null;
    }
  }

  async *subscribe<T extends EventType>(
    types: T[],
    context: FilterContext,
    signal?: AbortSignal,
  ): AsyncIterableIterator<{ type: T; payload: EventMap[T] }> {
    await this.subscriber.subscribe(REDIS_CHANNEL);

    const messageIterator = this.createMessageIterator(signal);

    try {
      for await (const message of messageIterator) {
        const event = this.parseAndValidateEvent(message, types);
        if (!event) continue;

        const { type, payload } = event;
        if (this.shouldSkipEvent(type, payload, context)) {
          console.log("Event filtered out:", type);
          continue;
        }

        console.log("Yielding event:", type);
        yield { type, payload } as { type: T; payload: EventMap[T] };
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

    const schema = eventSchemas[type];
    const result = schema.safeParse(event.payload);

    if (!result.success) {
      throw new Error(
        `Invalid payload for ${type}: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`,
      );
    }

    await this.publisher.publish(REDIS_CHANNEL, JSON.stringify(event));
  }

  private shouldSkipEvent<T extends EventType>(
    type: T,
    payload: EventMap[T],
    context: FilterContext,
  ): boolean {
    if ("userId" in payload && payload.userId === context.user.id) {
      return true; // Skip own user events
    }
    return false;
  }

  async cleanup(): Promise<void> {
    await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
  }
}

// Create singleton instance
export const eventBus = new EventBus(redisConfig);
