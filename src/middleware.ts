import { type NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/server/auth";

function generateRandomUsername(): string {
  const timestamp = Date.now();
  return `Guest${timestamp}`;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  // If no token exists, create a new user session
  if (!token) {
    const userId = crypto.randomUUID();
    const username = generateRandomUsername();
    const now = new Date();

    const payload = {
      id: userId,
      username: username,
      createdAt: now.toISOString(),
      updatedAt: null,
      jti: crypto.randomUUID(),
    };

    const newToken = await encrypt(payload);
    const response = NextResponse.next();

    response.cookies.set({
      name: "token",
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
