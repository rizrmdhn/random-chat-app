import "server-only";

import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { users } from "../db/schema";
import { hash } from "@node-rs/argon2";

export async function createUser(
  username: string,
  password: string,
  type: "user" | "guest",
) {
  const [result] = await db
    .insert(users)
    .values({
      username,
      password: password ? await hash(password) : null,
      type,
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
