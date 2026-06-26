import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE = "revops_session"
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-production"
)

const PUBLIC_PATHS = ["/login", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.redirect(new URL("/login", request.url))

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
