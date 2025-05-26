import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    const { payload } = await jwtVerify(token, secret)
    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}