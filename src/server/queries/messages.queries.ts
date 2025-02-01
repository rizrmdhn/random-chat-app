import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { messages } from "../db/schema";
import { TRPCError } from "@trpc/server";

export async function getMessageByChannelId(channel: string) {
  const result = await db.query.messages.findMany({
    where: eq(messages.channelId, channel),
    with: {
      user: true,
    },
  });

  return result;
}

export async function createMessage(
  channel: string,
  userId: string,
  content: string,
) {
  const [result] = await db
    .insert(messages)
    .values({
      channelId: channel,
      userId,
      message: content,
    })
    .returning()
    .execute();

  if (!result) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create message",
    });
  }

  return result;
}
