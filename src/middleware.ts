import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/:path*"],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  // Bypass for assets, api/public (if any), etc.
  if (url.pathname.includes(".") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Check if authentication is enabled via env vars
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !pwd) {
    return NextResponse.next();
  }

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [authUser, authPwd] = atob(authValue).split(":");

    if (authUser === user && authPwd === pwd) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

