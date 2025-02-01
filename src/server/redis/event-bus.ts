import "server-only";

import { Redis, type RedisOptions } from "ioredis";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { type Session, type SessionUser } from "../auth";
import redisConfig from "./config";
import { env } from "@/env";

// Event Types Definition
export const EVENT_TYPES = [
  "user.created",
  "user.updated",
  "user.deleted",
  "channel.created",
  "message.sent",
  "message.received",
  "message.deleted",
  "message.updated",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

type UserEvent = z.infer<typeof schemas.user>;
type UserDeletedEvent = z.infer<typeof schemas.userDeleted>;
type ChannelEvent = z.infer<typeof schemas.channel>;
type MessageEvent = z.infer<typeof schemas.message>;

// Update EventMap to use the inferred types
export type EventMap = {
  "user.created": UserEvent;
  "user.updated": UserEvent;
  "user.deleted": UserDeletedEvent;
  "channel.created": ChannelEvent;
  "message.sent": MessageEvent;
  "message.received": MessageEvent;
  "message.deleted": MessageEvent;
  "message.updated": MessageEvent;
};

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
  private isDevelopment: boolean;

  constructor(config: RedisOptions) {
    this.publisher = new Redis(config);
    this.subscriber = new Redis(config);
    this.isDevelopment = env.NODE_ENV === "development";
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

      const parsed = z
        .object({
          type: z.enum(EVENT_TYPES),
          payload: z.unknown(),
        })
        .parse(data);

      if (!allowedTypes.includes(parsed.type as T)) {
        if (this.isDevelopment) {
          console.log("Event type not in subscription list:", parsed.type);
        }
        return null;
      }

      const schema = eventSchemas[parsed.type];
      const result = schema.safeParse(parsed.payload);

      if (!result.success) {
        if (this.isDevelopment) {
          console.error(
            `Invalid payload for ${parsed.type}:`,
            result.error.errors,
          );
        }
        return null;
      }

      return {
        type: parsed.type as T,
        payload: result.data as EventMap[T],
      };
    } catch (error) {
      if (this.isDevelopment) {
        console.error("Failed to parse message:", error);
      }
      return null;
    }
  }

  async *subscribe<T extends EventType>(
    types: T[],
    context: FilterContext,
    signal?: AbortSignal,
  ): AsyncIterableIterator<{ type: T; payload: EventMap[T] }> {
    await this.subscriber.subscribe(REDIS_CHANNEL);
    if (this.isDevelopment) {
      console.log(`Subscribed to events:`, types);
    }

    const messageIterator = this.createMessageIterator(signal);

    try {
      for await (const message of messageIterator) {
        const event = this.parseAndValidateEvent(message, types);
        if (!event) continue;

        const { type, payload } = event;
        if (this.shouldSkipEvent(type, payload, context)) {
          if (this.isDevelopment) {
            console.log(`Skipping event ${type} for user ${context.user.id}`);
          }
          continue;
        }

        yield { type, payload } as { type: T; payload: EventMap[T] };
      }
    } finally {
      await this.subscriber.unsubscribe(REDIS_CHANNEL);
      if (this.isDevelopment) {
        console.log("Unsubscribed from events");
      }
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
      const error = `Invalid payload for ${type}: ${result.error.errors
        .map((e) => e.message)
        .join(", ")}`;
      if (this.isDevelopment) {
        console.error(error);
      }
      throw new Error(error);
    }

    if (this.isDevelopment) {
      console.log(`Publishing event:`, event);
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
    if (this.isDevelopment) {
      console.log("EventBus cleaned up");
    }
  }
}

// Create singleton instance
export const eventBus = new EventBus(redisConfig);
