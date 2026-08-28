import { NextResponse } from "next/server";

/**
 * Proxy fix for root path 404 behind Apache reverse proxy.
 * When the proxy passes a malformed path for / (e.g. empty, "//"),
 * Next.js may not match app/page.js. This normalizes the path.
 */
export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "" || pathname === "//") {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "//"],
};
