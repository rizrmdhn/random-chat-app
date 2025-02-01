import "server-only";

import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { users } from "../db/schema";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

export async function getUserByUsername(username: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return user;
}

export async function createUser(username: string, password: string) {
  const [result] = await db
    .insert(users)
    .values({
      username,
      password: await hash(password),
    })
    .returning()
    .execute();

  if (!result) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create user",
    });
  }

  return result;
}
