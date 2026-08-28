import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.tijaar.com";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const host = (req.headers.get("host") || "").split(":")[0];
  const { pathname } = url;

  if (pathname === "" || pathname === "//" || pathname === "/index.php") {
    url.pathname = "/";
    return NextResponse.rewrite(url);
  }

  // /blog (no slug) is not a valid page — canonical blog listing is /blogs
  if (pathname === "/blog") {
    url.pathname = "/blogs";
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  // Apex tijaar.com → www.tijaar.com (all paths, including /blogs)
  if (host === "tijaar.com") {
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/index.php",
    "/blog",
    "/blogs",
    "/blog/:path*",
    "/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|images|google1b8563837b67ed33.html|robots.txt|llm.txt|llms.txt|sitemap.xml|sitemap-static.xml|sitemap-categories.xml|sitemap-products|.*\\..*).*)",
  ],
};
