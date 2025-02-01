import { type NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/server/auth";
import { env } from "./env";

function generateRandomUsername(): string {
  const timestamp = Date.now();
  return `Guest${timestamp}`;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("guestToken");

  // If no token exists, create a new user session
  if (!token) {
    const username = generateRandomUsername();

    const responsePost = await fetch(
      new URL("/api/generate/user", request.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-generate-user-signature": env.GENERATE_USER_KEY,
        },
        body: JSON.stringify({
          username: username,
          password: "",
        }),
      },
    );

    if (!responsePost.ok) {
      throw new Error("Failed to create user");
    }

    const userData = (await responsePost.json()) as {
      id: string;
      username: string;
      type: string;
      createdAt: string;
      updatedAt: string;
    };

    const payload = {
      id: userData.id,
      username: userData.username,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      jti: userData.id,
    };

    const newToken = await encrypt(payload);
    const response = NextResponse.next();

    response.cookies.set({
      name: "guestToken",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  }

  // Continue with existing token
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
