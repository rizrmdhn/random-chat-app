export const EVENT_TYPES = [
  "user.created",
  "user.updated",
  "user.deleted",
  "post.created",
  "post.updated",
  "post.deleted",
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

export interface PostEvent extends BaseEvent {
  postId: string;
  title: string;
  authorId: string;
}

export type EventMap = {
  "user.created": UserEvent;
  "user.updated": UserEvent;
  "user.deleted": Pick<UserEvent, "userId" | "id" | "timestamp">;
  "post.created": PostEvent;
  "post.updated": PostEvent;
  "post.deleted": Pick<PostEvent, "postId" | "id" | "timestamp">;
};
