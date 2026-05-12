// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'muskan-token'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  // If cookie is NOT EVEN PRESENT in the request, this will be null/undefined
  if (!token) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.headers.set('x-auth-fail', 'no-cookie-on-request')
    return res
  }

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.headers.set('x-auth-fail', 'missing-jwt-secret-in-middleware')
    return res
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(token, secret)

    // pass through
    const res = NextResponse.next()
    res.headers.set('x-auth-ok', '1')
    return res
  } catch (e) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.headers.set('x-auth-fail', 'jwt-verify-failed')
    // clear cookie to stop loops
    res.cookies.set(COOKIE_NAME, '', { path: '/', expires: new Date(0), httpOnly: true })
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
