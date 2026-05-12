import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'nodejs' // ensures normal Node runtime/env behavior

const COOKIE_NAME = 'muskan-token'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    // This means the cookie was not included in the request
    return NextResponse.json(
      { error: 'No token (cookie not sent)', cookiesSeen: request.cookies.getAll().map(c => c.name) },
      { status: 401 }
    )
  }

  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    return NextResponse.json({ error: 'JWT_SECRET missing on server' }, { status: 500 })
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return NextResponse.json({ user: payload }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Invalid token (verify failed)', message: e?.message },
      { status: 401 }
    )
  }
}
