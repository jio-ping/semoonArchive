import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAdminCreatePage =
    request.nextUrl.pathname.startsWith("/admin/create");

  const authCookie = request.cookies.get("admin-auth")?.value;

  if (isAdminCreatePage && authCookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin/create",
};
