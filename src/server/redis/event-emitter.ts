import { EventEmitter } from "events";
import type { EventType, EventMap } from "@/types/event.types";

class TypedEventEmitter extends EventEmitter {
  async *toIterable<T extends EventType>(
    type: T,
    options: { signal?: AbortSignal } = {},
  ): AsyncIterableIterator<EventMap[T]> {
    while (!options.signal?.aborted) {
      try {
        yield await new Promise<EventMap[T]>((resolve, reject) => {
          const cleanup = () => {
            this.removeListener(type, handler);
            this.removeListener("error", errorHandler);
          };

          const handler = (payload: EventMap[T]) => {
            cleanup();
            resolve(payload);
          };

          const errorHandler = (error: Error) => {
            cleanup();
            reject(error);
          };

          this.once(type, handler);
          this.once("error", errorHandler);

          options.signal?.addEventListener("abort", () => {
            cleanup();
            reject(new Error("Aborted"));
          });
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Aborted") {
            break;
          }
          console.error("Event iteration error:", error);
        }

        console.error("Event iteration error:", error);
      }
    }
  }
}

export const eventEmitter = new TypedEventEmitter();
