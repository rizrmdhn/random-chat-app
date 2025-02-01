import { registerSchema } from "@/schema/auth.schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { encrypt } from "@/server/auth";
import { createTokenCookie, deleteTokenCookie } from "@/server/auth/utils";
import { createUser, getUserByUsername } from "@/server/queries/users.queries";
import { verify } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input: { username, password } }) => {
      const user = await getUserByUsername(username);

      if (!user) {
        throw new Error("User not found");
      }

      // verify password
      const verifyPasswordResult = await verify(user.password, password);

      if (!verifyPasswordResult) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid User Credentials",
        });
      }

      // create token
      const token = await encrypt({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        jti: user.id,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      });

      void createTokenCookie(
        token,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      );

      return true;
    }),

  logout: protectedProcedure.mutation(async () => {
    void deleteTokenCookie();

    return true;
  }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input: { username, password } }) => {
      // create user
      const user = await getUserByUsername(username);

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      await createUser(username, password);

      return true;
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});
