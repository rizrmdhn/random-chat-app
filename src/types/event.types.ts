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

export interface BaseEvent {
  id: string;
  timestamp: Date;
}

export interface UserEvent extends BaseEvent {
  userId: string;
  email: string;
  name: string;
}

export interface ChannelEvent extends BaseEvent {
  channelId: string;
  name: string;
}

export interface MessageEvent extends BaseEvent {
  messageId: string;
  channelId: string;
  userId: string;
  message: string;
}

export type EventMap = {
  "user.created": UserEvent;
  "user.updated": UserEvent;
  "user.deleted": Pick<UserEvent, "userId" | "id" | "timestamp">;
  "channel.created": ChannelEvent;
  "message.sent": MessageEvent;
  "message.received": MessageEvent;
  "message.deleted": Pick<MessageEvent, "messageId" | "id" | "timestamp">;
  "message.updated": MessageEvent;
};
