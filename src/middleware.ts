import { type NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/server/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;
  const publicRoutes = ["/sign-in", "/sign-up", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Handle public routes
  if (isPublicRoute) {
    if (!token) return NextResponse.next();
    return handleAuthenticatedPublicRoute(token.value, request);
  }

  // Handle protected routes
  if (!token) {
    return redirectToSignIn(request);
  }

  return handleProtectedRoute(token.value, request);
}

async function handleAuthenticatedPublicRoute(
  token: string,
  request: NextRequest,
) {
  try {
    await decrypt(token);
    return NextResponse.redirect(new URL("/chat", request.url));
  } catch {
    const response = NextResponse.next();
    response.cookies.delete("token");
    return response;
  }
}

async function handleProtectedRoute(token: string, request: NextRequest) {
  try {
    await decrypt(token);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("token");
    return response;
  }
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(new URL("/sign-in", request.url));
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
