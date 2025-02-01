// src/utils/typeGuards.ts
import {
  type EventType,
  type EventMap,
  EVENT_TYPES,
} from "@/types/event.types";

export function isValidEventType(type: unknown): type is EventType {
  return typeof type === "string" && EVENT_TYPES.includes(type as EventType);
}

export function isValidEvent<T extends EventType>(
  event: unknown,
  type: T,
): event is { type: T; payload: EventMap[T] } {
  if (!event || typeof event !== "object") return false;

  const e = event as { type: string; payload: unknown };
  return e.type === type && e.payload !== null && typeof e.payload === "object";
}
