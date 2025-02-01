import type {
  ChannelEvent,
  MessageEvent,
  UserDeletedEvent,
  UserEvent,
} from "./event-schema";

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
