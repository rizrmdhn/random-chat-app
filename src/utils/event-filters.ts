import type { EventType, EventMap } from "@/types/event.types";
import { type Session, type SessionUser } from "@/server/auth";

type FilterContext = {
  session: Session;
  user: SessionUser;
};

// Generic filter type
export type EventFilter<T extends EventType> = {
  type: T;
  filter: (event: EventMap[T], context: FilterContext) => boolean;
};

// Define filters for each event type
const eventFilters: {
  [T in EventType]: (event: EventMap[T], context: FilterContext) => boolean;
} = {
  "user.created": (event, context) => {
    // Skip if it's the current user
    return event.userId === context.user.id;
  },
  "user.updated": (event, context) => {
    // Skip if it's the current user
    return event.userId === context.user.id;
  },
  "user.deleted": (event, context) => {
    // Skip if it's the current user
    return event.userId === context.user.id;
  },
  "post.created": (event, context) => {
    // Skip if it's the current user's post
    return event.authorId === context.user.id;
  },
  "post.updated": (event, context) => {
    // Skip if it's the current user's post
    return event.authorId === context.user.id;
  },
  "post.deleted": (event, context) => {
    // Skip if it's the current user's post
    return event.postId === context.user.id;
  },
};

export function shouldSkipEvent<T extends EventType>(
  type: T,
  event: EventMap[T],
  context: FilterContext,
): boolean {
  return eventFilters[type](event, context);
}
