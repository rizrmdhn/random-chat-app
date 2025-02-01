import { env } from "@/env";
import { createUser } from "@/server/queries/users.queries";
import type { NextRequest } from "next/server";

async function validateSignature(signature: string) {
  if (!signature) {
    return false;
  }

  if (signature !== env.GENERATE_USER_KEY) return false;

  return true;
}

async function POST(req: NextRequest) {
  const middlewareSignature = req.headers.get("x-generate-user-signature");

  if (!middlewareSignature)
    return new Response("Unauthorized", { status: 401 });

  if (!(await validateSignature(middlewareSignature))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const requestBody = (await req.json()) as {
    username: string;
    password: string;
  };

  const user = await createUser(
    requestBody.username,
    requestBody.password,
    "guest",
  );

  if (!user) {
    return new Response("Failed to create user", { status: 500 });
  }

  return Response.json(user, { status: 201 });
}

export { POST };
