// src/server/redis/eventBus.ts
import { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { eventEmitter } from "./event-emitter";
import { z } from "zod";
import type { EventType, EventMap } from "@/types/event.types";
import { EVENT_TYPES } from "@/types/event.types";
import {
  postDeletedEventSchema,
  postEventSchema,
  userDeletedEventSchema,
  userEventSchema,
} from "./event-schema";
import { isValidEvent } from "@/utils/type-guards";

// First, define the raw event structure
const rawEventSchema = z.object({
  type: z.enum(EVENT_TYPES),
  payload: z.unknown(), // Start with unknown for raw JSON
});

type RawEvent = z.infer<typeof rawEventSchema>;

export class EventBus {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
    this.initialize();
  }

  private initialize(): void {
    void this.subscriber.subscribe("events");

    this.subscriber.on("message", (_channel: string, message: string) => {
      try {
        const data = JSON.parse(message) as unknown;
        const parsedEvent = rawEventSchema.safeParse(data);

        if (
          !parsedEvent.success ||
          !isValidEvent(parsedEvent.data, parsedEvent.data.type)
        ) {
          throw new Error("Invalid event format");
        }

        const { type, payload } = parsedEvent.data;

        // Now TypeScript knows these are type-safe
        eventEmitter.emit(type, payload);
      } catch (error) {
        console.error("Failed to parse event:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        eventEmitter.emit(
          "error",
          new Error(`Event parsing failed: ${errorMessage}`),
        );
      }
    });
  }

  public async publish<T extends EventType>(
    type: T,
    payload: Omit<EventMap[T], "id" | "timestamp">,
  ): Promise<void> {
    const event: RawEvent = {
      type,
      payload: {
        ...payload,
        id: uuidv4(),
        timestamp: new Date(),
      },
    };

    // Validate before publishing
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        userEventSchema.parse(event.payload);
        break;
      }
      case "user.deleted": {
        userDeletedEventSchema.parse(event.payload);
        break;
      }
      case "post.created":
      case "post.updated": {
        postEventSchema.parse(event.payload);
        break;
      }
      case "post.deleted": {
        postDeletedEventSchema.parse(event.payload);
        break;
      }
      default: {
        throw new Error(`Unhandled event type: ${String(event.type)}`);
      }
    }

    await this.publisher.publish("events", JSON.stringify(event));
  }

  public async cleanup(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}
