import "server-only";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { channels } from "../db/schema";
import { TRPCError } from "@trpc/server";

export async function getChannelList() {
  const data = await db.query.channels.findMany();

  return data;
}

export async function getChannelById(id: string) {
  const data = await db.query.channels.findFirst({
    where: eq(channels.id, id),
  });

  if (!data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Channel not found",
    });
  }

  return data;
}

export async function createChannel(name: string) {
  const [data] = await db
    .insert(channels)
    .values({
      name,
    })
    .returning({
      insertedId: channels.id,
    })
    .execute();

  if (!data) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create channel",
    });
  }

  return data;
}
